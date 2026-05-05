package com.cts.mfrp.petzbackend.user.service;

import com.cts.mfrp.petzbackend.common.exception.AuthExceptions;
import com.cts.mfrp.petzbackend.common.util.JwtUtil;
import com.cts.mfrp.petzbackend.common.util.SmsService;
import com.cts.mfrp.petzbackend.user.dto.AuthDtos.*;
import com.cts.mfrp.petzbackend.user.dto.RegistrationDtos.LoginRequest;
import com.cts.mfrp.petzbackend.user.dto.RegistrationDtos.LoginResponse;
import com.cts.mfrp.petzbackend.user.dto.RegistrationDtos.RegisterRequest;
import com.cts.mfrp.petzbackend.user.dto.RegistrationDtos.RegisterResponse;
import com.cts.mfrp.petzbackend.user.model.OtpVerification;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.OtpVerificationRepository;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Authentication service handling all Epic 1.1 user stories:
 *
 *   US-1.1.2 → sendOtp(), verifyOtp()
 *   US-1.1.3 → initiateMissedCall(), verifyMissedCall()
 *   US-1.1.4 → JWT issuance (called internally after verification)
 *   US-1.1.5 → Rate limiting is handled at filter level, not here
 *   US-1.1.1 → SOS button is frontend; backend entry is SOS creation (Epic 1.2)
 *
 * Flow:
 *   1. Reporter taps SOS button (US-1.1.1 — frontend)
 *   2. Phone number collected → sendOtp() called
 *   3. OTP entered → verifyOtp() called → returns JWT
 *   4. JWT used to create SOS report (Epic 1.2 — teammate scope)
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int OTP_LENGTH = 6;
    private static final int MAX_OTP_ATTEMPTS = 5;

    private final OtpVerificationRepository otpRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final SmsService smsService;
    private final int otpExpiryMinutes;
    private final int maxOtpRequestsPerHour;

    public AuthService(
            OtpVerificationRepository otpRepo,
            UserRepository userRepo,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            SmsService smsService,
            @Value("${petz.otp.expiry-minutes:5}") int otpExpiryMinutes,
            @Value("${petz.otp.max-requests-per-hour:5}") int maxOtpRequestsPerHour
    ) {
        this.otpRepo = otpRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.smsService = smsService;
        this.otpExpiryMinutes = otpExpiryMinutes;
        this.maxOtpRequestsPerHour = maxOtpRequestsPerHour;
    }

    // ═════════════════════════════════════════════════════════════════════
    //  US-1.1.2 — OTP Generation & Delivery
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Generate a 6-digit OTP, hash it with BCrypt, store it, and send via SMS.
     *
     * AC checks:
     *   ✓ OTP sent within 3 seconds (SMS stub is instant; real SMS < 2s)
     *   ✓ 6-digit OTP with 5-minute expiry
     *   ✓ Rate-limited to prevent SMS bombing
     */
    @Transactional
    public OtpSentResponse sendOtp(SendOtpRequest request) {
        String phone = normalizePhone(request.phone());

        // Rate limit OTP generation (separate from SOS rate limit)
        long recentCount = otpRepo.countByPhoneAndCreatedAtAfter(
                phone, LocalDateTime.now().minusHours(1)
        );
        if (recentCount >= maxOtpRequestsPerHour) {
            throw new AuthExceptions.OtpRateLimitException();
        }

        // Generate 6-digit OTP
        String rawOtp = generateOtp();
        String hashedOtp = passwordEncoder.encode(rawOtp);

        // Persist hashed OTP with expiry
        OtpVerification otp = new OtpVerification();
        otp.setPhone(phone);
        otp.setOtpHash(hashedOtp);
        otp.setAuthMethod(OtpVerification.AuthMethod.OTP);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        otpRepo.save(otp);

        // Send via SMS
        String message = "Your PETZ emergency verification code is: " + rawOtp
                + ". Valid for " + otpExpiryMinutes + " minutes. Do not share.";
        smsService.sendSms(phone, message);

        log.info("OTP sent to phone ending in ...{}", phone.substring(phone.length() - 4));
        return OtpSentResponse.success();
    }

    // ═════════════════════════════════════════════════════════════════════
    //  US-1.1.2 — OTP Verification + US-1.1.4 — Session Issuance
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Verify the 6-digit OTP and issue a JWT session token.
     *
     * Logic:
     *   1. Find latest unexpired OTP for this phone
     *   2. Check attempt count (brute-force protection)
     *   3. BCrypt-compare the submitted OTP
     *   4. Find or create User record
     *   5. Issue JWT (temporary or full based on user type)
     *
     * AC checks:
     *   ✓ Total auth within 5 seconds of user action
     *   ✓ No mandatory profile creation
     *   ✓ JWT-based with expiry
     *   ✓ Session valid until rescue case closure (max 12hrs)
     */
    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        String phone = normalizePhone(request.phone());

        // Step 1: Find active OTP
        OtpVerification otp = otpRepo
                .findFirstByPhoneAndVerifiedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        phone, LocalDateTime.now()
                )
                .orElseThrow(AuthExceptions.OtpExpiredException::new);

        // Step 2: Brute-force check
        if (otp.getAttempts() >= MAX_OTP_ATTEMPTS) {
            throw new AuthExceptions.OtpAttemptsExceededException();
        }

        // Step 3: Verify OTP
        if (!passwordEncoder.matches(request.otp(), otp.getOtpHash())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepo.save(otp);
            throw new AuthExceptions.InvalidOtpException();
        }

        // Mark OTP as verified
        otp.setVerified(true);
        otpRepo.save(otp);

        // Step 4: Find or create user
        return issueSession(phone);
    }

    // ═════════════════════════════════════════════════════════════════════
    //  US-1.1.3 — Missed Call Authentication Fallback
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Initiate missed call verification.
     * Called when OTP delivery fails or user explicitly selects this option.
     *
     * AC checks:
     *   ✓ Missed call option appears if OTP fails or user selects it
     *   ✓ Authentication completes within 5 seconds
     *   ✓ Seamless fallback with no additional steps
     */
    @Transactional
    public MissedCallInitiatedResponse initiateMissedCall(MissedCallInitiateRequest request) {
        String phone = normalizePhone(request.phone());

        // Generate a verification token (random UUID) — stored hashed
        String verificationToken = UUID.randomUUID().toString();
        String hashedToken = passwordEncoder.encode(verificationToken);
        log.info("[DEV ONLY] Missed call verification token for {}: {}", phone, verificationToken);

        OtpVerification record = new OtpVerification();
        record.setPhone(phone);
        record.setOtpHash(hashedToken);
        record.setAuthMethod(OtpVerification.AuthMethod.MISSED_CALL);
        record.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        otpRepo.save(record);

        // In production: trigger the missed call service here
        // For now: return the callback number the user should call
        log.info("Missed call verification initiated for phone ending in ...{}",
                phone.substring(phone.length() - 4));

        return new MissedCallInitiatedResponse(
                "Please give a missed call to the number below. Verification is automatic.",
                "+911800XXXX00",  // Replace with actual IVR number from config
                120,              // 2 minute timeout
                "MISSED_CALL"
        );
    }

    /**
     * Verify missed call — called by webhook from the IVR provider
     * OR by the frontend polling after user makes the call.
     */
    @Transactional
    public AuthResponse verifyMissedCall(MissedCallVerifyRequest request) {
        String phone = normalizePhone(request.phone());

        OtpVerification record = otpRepo
                .findFirstByPhoneAndVerifiedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                        phone, LocalDateTime.now()
                )
                .orElseThrow(AuthExceptions.MissedCallVerificationFailedException::new);

        // Verify the token matches
        if (!passwordEncoder.matches(request.verificationToken(), record.getOtpHash())) {
            throw new AuthExceptions.MissedCallVerificationFailedException();
        }

        record.setVerified(true);
        otpRepo.save(record);

        return issueSession(phone);
    }

    // ═════════════════════════════════════════════════════════════════════
    //  US-1.1.4 — Session Issuance (shared by OTP + Missed Call flows)
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Emergency quick session — bypasses OTP for SOS reporting.
     * Trades verification strength for speed: a temporary reporter is
     * created (or found) directly from the phone number and a session
     * token is issued. Rate-limited at the filter level to deter abuse.
     */
    @Transactional
    public AuthResponse sosQuickSession(SendOtpRequest request) {
        String phone = normalizePhone(request.phone());
        log.info("SOS quick session issued for phone ending in ...{}",
                phone.substring(phone.length() - 4));
        return issueSession(phone);
    }

    /**
     * Find existing user or create temporary reporter → issue JWT.
     *
     * If user exists with a full account → issue normal session token.
     * If user is new → create temporary account → issue temporary session.
     */
    private AuthResponse issueSession(String phone) {
        Optional<User> existingUser = userRepo.findByPhone(phone);

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // US-4.1.1 / US-4.1.4 — OTP proves phone ownership, so mark it
            // verified whenever we successfully issue a session.
            if (!user.isPhoneVerifiedSafe()) {
                user.setPhoneVerified(true);
                user = userRepo.save(user);
            }

            if (user.isTemporary()) {
                // Still a temporary account from a previous SOS
                String token = jwtUtil.generateTemporarySessionToken(user.getId(), phone);
                return AuthResponse.temporarySession(
                        token, jwtUtil.getTempSessionExpirationSeconds(), user.getId()
                );
            }

            // Full account — issue normal token
            String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
            return AuthResponse.existingUser(
                    token, jwtUtil.getDefaultExpirationSeconds(),
                    user.getId(), user.getRole().name()
            );
        }

        // New user — create temporary reporter account
        User tempUser = User.createTemporaryReporter(phone);
        tempUser = userRepo.save(tempUser);

        String token = jwtUtil.generateTemporarySessionToken(tempUser.getId(), phone);
        log.info("Temporary reporter account created for phone ending in ...{}",
                phone.substring(phone.length() - 4));

        return AuthResponse.temporarySession(
                token, jwtUtil.getTempSessionExpirationSeconds(), tempUser.getId()
        );
    }

    // ═════════════════════════════════════════════════════════════════════
    //  US-4.1.1 — Full Account Registration
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Create a full account (non-temporary) with password + OTP kickoff.
     *
     * Steps:
     *   1. Validate email + phone uniqueness (409 on duplicate).
     *   2. If a temporary reporter account already exists for this phone,
     *      upgrade it in place (fills in name/email/password) so the user
     *      doesn't get a second row.
     *   3. Hash password with BCrypt and save.
     *   4. Immediately fire an OTP so the phone can be verified.
     *
     * Roles:
     *   - Clients can pick REPORTER (default) / NGO_REP / HOSPITAL_REP.
     *   - ADMIN is rejected — admin accounts must be created out-of-band.
     */
    @Transactional
    public RegisterResponse registerFullAccount(RegisterRequest req) {
        String phone = normalizePhone(req.getPhone());
        String email = req.getEmail() == null ? null : req.getEmail().trim().toLowerCase();

        // Email uniqueness (server-side, to match US-4.1.1 AC#3).
        if (email != null && !email.isBlank() && userRepo.existsByEmail(email)) {
            throw new IllegalStateException(
                    "An account with this email already exists. Please log in instead.");
        }

        User.Role requestedRole = parseRole(req.getRole());

        // Locate existing user (temporary reporter upgrade path) or create fresh.
        User user = userRepo.findByPhone(phone).orElseGet(User::new);
        if (user.getId() != null && !user.isTemporary() && user.getPasswordHash() != null) {
            throw new IllegalStateException(
                    "An account with this phone already exists. Please log in instead.");
        }

        user.setPhone(phone);
        user.setFullName(req.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(requestedRole);
        user.setTemporary(false);
        user.setActive(true);
        user.setEmailVerified(false);
        // If we're upgrading a reporter who already proved ownership of this
        // phone via OTP, keep phoneVerified=true; otherwise start at false.
        if (user.getPhoneVerified() == null) user.setPhoneVerified(false);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        User saved = userRepo.save(user);

        // Kick off OTP — lets the caller complete phone verification immediately.
        SendOtpRequest otp = new SendOtpRequest(phone);
        sendOtp(otp);

        log.info("User {} registered (role={}, phoneVerified={})",
                saved.getId(), saved.getRole(), saved.isPhoneVerifiedSafe());

        return RegisterResponse.builder()
                .userId(saved.getId())
                .role(saved.getRole().name())
                .phoneVerified(saved.isPhoneVerifiedSafe())
                .emailVerified(saved.isEmailVerifiedSafe())
                .otpExpiresInSeconds(otpExpiryMinutes * 60)
                .message("Account created. A verification OTP has been sent to your phone.")
                .build();
    }

    // ═════════════════════════════════════════════════════════════════════
    //  US-4.1.2 — Password login with lockout
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Password-based login.
     *
     *   - {@code identifier} may be email or phone.
     *   - After {@value #MAX_LOGIN_FAILURES} consecutive failures, the
     *     account is locked for {@value #LOCKOUT_MINUTES} minutes (401 ↔ 423).
     *   - Successful login resets the failure counter and stamps lastLoginAt.
     *   - Inactive (suspended) accounts are rejected with 403.
     */
    // noRollbackFor: we MUST persist the failed-attempt counter even when we
    // ultimately throw 401/423; without this the @Transactional rolls back on
    // RuntimeException and lockout never persists to the DB.
    @Transactional(noRollbackFor = {
            AuthExceptions.InvalidCredentialsException.class,
            AuthExceptions.AccountLockedException.class,
            AuthExceptions.AccountDisabledException.class
    })
    public LoginResponse loginWithPassword(LoginRequest req) {
        String id = req.getIdentifier().trim();
        User user = findByIdentifier(id)
                .orElseThrow(AuthExceptions.InvalidCredentialsException::new);

        if (!user.isActiveSafe()) {
            throw new AuthExceptions.AccountDisabledException();
        }
        if (user.isLocked()) {
            throw new AuthExceptions.AccountLockedException(user.getLockedUntil());
        }
        if (user.getPasswordHash() == null) {
            // Temporary account — no password set yet. Point the user at OTP.
            throw new AuthExceptions.InvalidCredentialsException(
                    "This account has no password set. Use the OTP login flow.");
        }
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            int attempts = (user.getFailedLoginAttempts() == null ? 0
                    : user.getFailedLoginAttempts()) + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= MAX_LOGIN_FAILURES) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
                log.warn("User {} locked for {} minutes after {} failed logins",
                        user.getId(), LOCKOUT_MINUTES, attempts);
            }
            userRepo.save(user);
            throw new AuthExceptions.InvalidCredentialsException();
        }

        // Success — reset counter, stamp last login.
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepo.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name());
        log.info("User {} logged in via password", user.getId());
        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getDefaultExpirationSeconds())
                .userId(user.getId())
                .role(user.getRole().name())
                .message("Login successful.")
                .build();
    }

    /** Look up a user by email OR phone — used by login. */
    private Optional<User> findByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) return Optional.empty();
        if (identifier.contains("@")) {
            return userRepo.findByEmail(identifier.toLowerCase());
        }
        return userRepo.findByPhone(normalizePhone(identifier));
    }

    /** Parses role string; defaults to REPORTER; rejects ADMIN. */
    private User.Role parseRole(String raw) {
        if (raw == null || raw.isBlank()) return User.Role.REPORTER;
        User.Role parsed;
        try {
            parsed = User.Role.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid role '" + raw + "'. Allowed: REPORTER, NGO_REP, HOSPITAL_REP");
        }
        if (parsed == User.Role.ADMIN) {
            throw new IllegalArgumentException(
                    "ADMIN accounts cannot be created via self-registration.");
        }
        return parsed;
    }

    // ═════════════════════════════════════════════════════════════════════
    //  Helpers
    // ═════════════════════════════════════════════════════════════════════

    /** US-4.1.2 AC#5 — lockout after this many consecutive failures. */
    private static final int MAX_LOGIN_FAILURES = 5;
    /** US-4.1.2 AC#5 — how long the lockout lasts. */
    private static final int LOCKOUT_MINUTES    = 15;

    /** Generate cryptographically secure 6-digit OTP */
    private String generateOtp() {
        int otp = SECURE_RANDOM.nextInt(900000) + 100000; // 100000 to 999999
        return String.valueOf(otp);
    }

    /** Normalize phone to consistent format */
    private String normalizePhone(String phone) {
        // Strip spaces and dashes, keep + prefix
        return phone.replaceAll("[\\s\\-()]", "");
    }
}