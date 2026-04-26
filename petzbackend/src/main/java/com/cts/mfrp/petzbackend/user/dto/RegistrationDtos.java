package com.cts.mfrp.petzbackend.user.dto;

import com.cts.mfrp.petzbackend.user.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Epic 4.1 — registration / login / profile DTOs.
 *
 *   US-4.1.1 RegisterRequest / RegisterResponse
 *   US-4.1.2 LoginRequest / LoginResponse
 *   US-4.1.4 ProfileResponse / ProfileUpdateRequest / PasswordChangeRequest
 *
 * Intentionally kept in a single file so reviewers see the shape of the
 * whole identity surface in one place — mirrors the style of
 * {@code AdoptionApplicationDtos} / {@code AppointmentBookingDtos}.
 */
public final class RegistrationDtos {

    private RegistrationDtos() {}

    // ═════════════════════════════════════════════════════════════════════
    //  US-4.1.1 — Registration
    // ═════════════════════════════════════════════════════════════════════

    /**
     * POST /api/v1/auth/register — initiates a full account.
     *
     *   1. Validates email uniqueness + phone uniqueness.
     *   2. Hashes the password (BCrypt).
     *   3. Creates User with {@code phoneVerified=false}, {@code emailVerified=false}.
     *   4. Fires an OTP to the phone so the caller can verify it.
     *
     * The account is created immediately but flagged unverified; the user
     * completes it by submitting {@code POST /verify-otp} or the
     * re-verify endpoint introduced in US-4.1.4.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        @NotBlank(message = "fullName is required")
        @Size(max = 120)
        private String fullName;

        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid address")
        @Size(max = 255)
        private String email;

        @NotBlank(message = "phone is required")
        @Pattern(regexp = "^\\+?[1-9]\\d{7,14}$", message = "Invalid phone number format")
        private String phone;

        @NotBlank(message = "password is required")
        @Size(min = 8, max = 72,
              message = "password must be between 8 and 72 characters")
        private String password;

        /**
         * Optional — defaults to ADOPTER when null. Clients can request any
         * role except ADMIN; admin accounts must be created manually.
         */
        private String role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterResponse {
        private UUID userId;
        private String role;
        private boolean phoneVerified;
        private boolean emailVerified;
        private String message;
        private int otpExpiresInSeconds;
    }

    // ═════════════════════════════════════════════════════════════════════
    //  US-4.1.2 — Login (password)
    // ═════════════════════════════════════════════════════════════════════

    /**
     * POST /api/v1/auth/login — password-based login.
     *
     * {@code identifier} can be either email or phone — service detects
     * which by shape. OTP login stays on the legacy /send-otp + /verify-otp
     * endpoints; this one is password-only.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        @NotBlank(message = "identifier (email or phone) is required")
        private String identifier;

        @NotBlank(message = "password is required")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginResponse {
        private String accessToken;
        private String tokenType;
        private long expiresIn;
        private UUID userId;
        private String role;
        private String message;
    }

    // ═════════════════════════════════════════════════════════════════════
    //  US-4.1.4 — Profile
    // ═════════════════════════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProfileResponse {
        private UUID id;
        private String role;
        private String fullName;
        private String phone;
        private String email;
        private UUID ngoId;
        private String profilePhotoUrl;
        private boolean phoneVerified;
        private boolean emailVerified;
        private boolean active;
        private boolean temporary;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
    }

    /**
     * PATCH /api/v1/users/me — partial profile update.
     *
     * Changing {@code email} or {@code phone} clears the corresponding
     * verified flag and requires re-verification via the existing OTP
     * flow (US-4.1.4 AC#2).
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProfileUpdateRequest {
        @Size(max = 120)
        private String fullName;

        @Email(message = "email must be a valid address")
        @Size(max = 255)
        private String email;

        @Pattern(regexp = "^\\+?[1-9]\\d{7,14}$", message = "Invalid phone number format")
        private String phone;
    }

    /**
     * POST /api/v1/users/me/password — change password.
     * Requires the current password to prevent session-hijack abuse.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PasswordChangeRequest {
        @NotBlank(message = "currentPassword is required")
        private String currentPassword;

        @NotBlank(message = "newPassword is required")
        @Size(min = 8, max = 72)
        private String newPassword;
    }
}
