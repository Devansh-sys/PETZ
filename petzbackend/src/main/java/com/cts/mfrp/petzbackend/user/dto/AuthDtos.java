package com.cts.mfrp.petzbackend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

/**
 * All DTOs for the Authentication flow.
 * US-1.1.2, US-1.1.3, US-1.1.4
 *
 * Using Java records for immutability and compact code.
 */
public final class AuthDtos {

    private AuthDtos() {} // prevent instantiation

    // ─── Requests ────────────────────────────────────────────────────────

    /** POST /api/v1/auth/send-otp */
    public record SendOtpRequest(
            @NotBlank(message = "Phone number is required")
            @Pattern(regexp = "^\\+?[1-9]\\d{7,14}$", message = "Invalid phone number format")
            String phone
    ) {}

    /** POST /api/v1/auth/verify-otp */
    public record VerifyOtpRequest(
            @NotBlank(message = "Phone number is required")
            @Pattern(regexp = "^\\+?[1-9]\\d{7,14}$", message = "Invalid phone number format")
            String phone,

            @NotBlank(message = "OTP is required")
            @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
            @Pattern(regexp = "^\\d{6}$", message = "OTP must contain only digits")
            String otp
    ) {}

    /** POST /api/v1/auth/missed-call/initiate */
    public record MissedCallInitiateRequest(
            @NotBlank(message = "Phone number is required")
            @Pattern(regexp = "^\\+?[1-9]\\d{7,14}$", message = "Invalid phone number format")
            String phone
    ) {}

    /** POST /api/v1/auth/missed-call/verify (webhook or poll) */
    public record MissedCallVerifyRequest(
            @NotBlank(message = "Phone number is required")
            String phone,

            @NotBlank(message = "Verification token is required")
            String verificationToken
    ) {}

    // ─── Responses ───────────────────────────────────────────────────────

    /** Returned after OTP is sent */
    public record OtpSentResponse(
            String message,
            int expiresInSeconds,
            String authMethod
    ) {
        public static OtpSentResponse success() {
            return new OtpSentResponse(
                    "OTP sent successfully. Valid for 5 minutes.",
                    300,
                    "OTP"
            );
        }
    }

    /** Returned after missed call is initiated */
    public record MissedCallInitiatedResponse(
            String message,
            String callbackNumber,
            int timeoutSeconds,
            String authMethod
    ) {}

    /** Returned after successful authentication (OTP or Missed Call) */
    public record AuthResponse(
            String accessToken,
            String tokenType,
            long expiresIn,
            UUID userId,
            String role,
            boolean isTemporarySession,
            String message
    ) {
        public static AuthResponse temporarySession(String token, long expiresIn, UUID userId) {
            return new AuthResponse(
                    token, "Bearer", expiresIn, userId, "REPORTER", true,
                    "Emergency session created. You can track your rescue status."
            );
        }

        public static AuthResponse existingUser(String token, long expiresIn, UUID userId, String role) {
            return new AuthResponse(
                    token, "Bearer", expiresIn, userId, role, false,
                    "Authentication successful."
            );
        }
    }
}