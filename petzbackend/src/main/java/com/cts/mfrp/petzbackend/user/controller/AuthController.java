package com.cts.mfrp.petzbackend.user.controller;

import com.cts.mfrp.petzbackend.user.dto.AuthDtos.*;
import com.cts.mfrp.petzbackend.user.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication REST controller.
 * Handles all Epic 1.1 stories:
 *
 *   POST /api/v1/auth/send-otp            → US-1.1.2
 *   POST /api/v1/auth/verify-otp          → US-1.1.2 + US-1.1.4
 *   POST /api/v1/auth/missed-call/initiate → US-1.1.3
 *   POST /api/v1/auth/missed-call/verify   → US-1.1.3 + US-1.1.4
 *
 * All endpoints under /api/v1/auth/** are public (no JWT required).
 * See SecurityConfig for permitAll() configuration.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ═════════════════════════════════════════════════════════════════════
    //  US-1.1.2 — Quick Authentication via OTP
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Step 1: Send OTP to the given phone number.
     *
     * Called when user taps SOS and enters their phone number.
     * OTP is generated, hashed, stored, and sent via SMS.
     *
     * @param request contains phone number
     * @return success message with expiry info
     */
    @PostMapping("/send-otp")
    public ResponseEntity<OtpSentResponse> sendOtp(
            @Valid @RequestBody SendOtpRequest request) {
        OtpSentResponse response = authService.sendOtp(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Step 2: Verify OTP and receive JWT session token.
     *
     * On success, returns a JWT that the frontend attaches to all
     * subsequent requests (SOS creation, status tracking, etc.).
     *
     * @param request contains phone + 6-digit OTP
     * @return JWT token + user info
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    // ═════════════════════════════════════════════════════════════════════
    //  US-1.1.3 — Missed Call Authentication Fallback
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Step 1: Initiate missed call verification.
     *
     * Called when OTP delivery fails or user selects missed call option.
     * Returns the phone number the user should give a missed call to.
     *
     * @param request contains phone number
     * @return callback number and timeout
     */
    @PostMapping("/missed-call/initiate")
    public ResponseEntity<MissedCallInitiatedResponse> initiateMissedCall(
            @Valid @RequestBody MissedCallInitiateRequest request) {
        MissedCallInitiatedResponse response = authService.initiateMissedCall(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Step 2: Verify missed call and receive JWT session token.
     *
     * Called by:
     * - Webhook from IVR provider (automated), or
     * - Frontend polling after user makes the call
     *
     * @param request contains phone + verification token
     * @return JWT token + user info
     */
    @PostMapping("/missed-call/verify")
    public ResponseEntity<AuthResponse> verifyMissedCall(
            @Valid @RequestBody MissedCallVerifyRequest request) {
        AuthResponse response = authService.verifyMissedCall(request);
        return ResponseEntity.ok(response);
    }

    // ═════════════════════════════════════════════════════════════════════
    //  Webhook endpoint for IVR provider callback (US-1.1.3)
    // ═════════════════════════════════════════════════════════════════════

    /**
     * Webhook called by the missed call / IVR provider when
     * verification is complete. This is a server-to-server call.
     *
     * NOTE: In production, validate the webhook signature to prevent
     * spoofed calls. The X-Webhook-Signature header should be verified
     * against the provider's shared secret.
     */
    @PostMapping("/webhook/missed-call-verified")
    public ResponseEntity<Void> missedCallWebhook(
            @RequestBody MissedCallVerifyRequest request,
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signature) {

        // TODO: Validate webhook signature in production
        authService.verifyMissedCall(request);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}