package com.cts.mfrp.petzbackend.user.service;

import com.cts.mfrp.petzbackend.common.exception.AuthExceptions;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.sosmedia.service.FileStorageService;
import com.cts.mfrp.petzbackend.user.dto.AuthDtos.SendOtpRequest;
import com.cts.mfrp.petzbackend.user.dto.RegistrationDtos.PasswordChangeRequest;
import com.cts.mfrp.petzbackend.user.dto.RegistrationDtos.ProfileResponse;
import com.cts.mfrp.petzbackend.user.dto.RegistrationDtos.ProfileUpdateRequest;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Epic 4.1 — profile management.
 *
 *   US-4.1.4 getProfile
 *   US-4.1.4 updateProfile (re-verify on phone/email change)
 *   US-4.1.4 changePassword (requires current password)
 *   US-4.1.4 uploadProfilePhoto
 *
 * The logic that fires a fresh OTP after a phone change is delegated back
 * to {@link AuthService#sendOtp} so the OTP rate-limit + hashing story
 * stays in one place.
 */
@Service
public class UserProfileService {

    private static final Logger log = LoggerFactory.getLogger(UserProfileService.class);

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final FileStorageService fileStorage;

    public UserProfileService(UserRepository userRepo,
                              PasswordEncoder passwordEncoder,
                              AuthService authService,
                              FileStorageService fileStorage) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
        this.fileStorage = fileStorage;
    }

    // ═════════════════════════════════════════════════════════════════════
    //  GET /api/v1/users/me
    // ═════════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UUID userId) {
        User u = loadUser(userId);
        return toProfileResponse(u);
    }

    // ═════════════════════════════════════════════════════════════════════
    //  PATCH /api/v1/users/me
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Partial update. When phone or email changes we clear the corresponding
     * verified flag (US-4.1.4 AC#2) and, for phone, immediately queue a new
     * OTP so the frontend can collect it on the same screen.
     */
    @Transactional
    public ProfileResponse updateProfile(UUID userId, ProfileUpdateRequest req) {
        User u = loadUser(userId);

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            u.setFullName(req.getFullName().trim());
        }

        boolean phoneChanged = false;
        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            String newPhone = req.getPhone().trim();
            if (!newPhone.equals(u.getPhone())) {
                if (userRepo.existsByPhone(newPhone)) {
                    throw new IllegalStateException(
                            "That phone is already registered to another account.");
                }
                u.setPhone(newPhone);
                u.setPhoneVerified(false);
                phoneChanged = true;
            }
        }

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            String newEmail = req.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(u.getEmail())) {
                if (userRepo.existsByEmail(newEmail)) {
                    throw new IllegalStateException(
                            "That email is already registered to another account.");
                }
                u.setEmail(newEmail);
                u.setEmailVerified(false);
            }
        }

        User saved = userRepo.save(u);

        if (phoneChanged) {
            // Kick off an OTP so the frontend can immediately re-verify.
            authService.sendOtp(new SendOtpRequest(saved.getPhone()));
            log.info("User {} changed phone; OTP dispatched for re-verification", saved.getId());
        }
        return toProfileResponse(saved);
    }

    // ═════════════════════════════════════════════════════════════════════
    //  POST /api/v1/users/me/password — change password
    // ═════════════════════════════════════════════════════════════════════

    @Transactional
    public void changePassword(UUID userId, PasswordChangeRequest req) {
        User u = loadUser(userId);
        if (u.getPasswordHash() == null) {
            throw new IllegalStateException(
                    "No password set. Complete registration first.");
        }
        if (!passwordEncoder.matches(req.getCurrentPassword(), u.getPasswordHash())) {
            throw new AuthExceptions.InvalidCredentialsException(
                    "Current password is incorrect.");
        }
        u.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        // Reset failure counters since the user just proved possession.
        u.setFailedLoginAttempts(0);
        u.setLockedUntil(null);
        userRepo.save(u);
        log.info("User {} changed password", u.getId());
    }

    // ═════════════════════════════════════════════════════════════════════
    //  POST /api/v1/users/me/photo — upload profile photo
    // ═════════════════════════════════════════════════════════════════════

    @Transactional
    public ProfileResponse uploadProfilePhoto(UUID userId, MultipartFile file) {
        User u = loadUser(userId);
        String url = fileStorage.storeProfilePhoto(file);
        u.setProfilePhotoUrl(url);
        User saved = userRepo.save(u);
        log.info("User {} uploaded profile photo: {}", u.getId(), url);
        return toProfileResponse(saved);
    }

    // ─── helpers ─────────────────────────────────────────────────────────

    private User loadUser(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "Missing caller identity — authenticate or send X-User-Id header in dev.");
        }
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    private ProfileResponse toProfileResponse(User u) {
        return ProfileResponse.builder()
                .id(u.getId())
                .role(u.getRole() != null ? u.getRole().name() : null)
                .fullName(u.getFullName())
                .phone(u.getPhone())
                .email(u.getEmail())
                .ngoId(u.getNgoId())
                .profilePhotoUrl(u.getProfilePhotoUrl())
                .phoneVerified(u.isPhoneVerifiedSafe())
                .emailVerified(u.isEmailVerifiedSafe())
                .active(u.isActiveSafe())
                .temporary(u.isTemporary())
                .lastLoginAt(u.getLastLoginAt())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
