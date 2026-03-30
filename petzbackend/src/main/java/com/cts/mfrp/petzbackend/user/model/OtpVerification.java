package com.cts.mfrp.petzbackend.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * OTP verification records for SOS quick authentication.
 * US-1.1.2: Quick Authentication via OTP
 * US-1.1.3: Missed Call Authentication Fallback
 * FRD Ref: FR-3.9
 *
 * Short-lived records. OTPs expire after 5 minutes.
 * A scheduled job should purge expired rows periodically.
 */
@Entity
@Table(name = "otp_verifications", indexes = {
        @Index(name = "idx_otp_phone", columnList = "phone"),
        @Index(name = "idx_otp_expires", columnList = "expires_at")
})
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 15)
    private String phone;

    /**
     * BCrypt-hashed OTP. NEVER store raw OTP.
     * For missed-call flow, stores a placeholder verification token.
     */
    @Column(name = "otp_hash", nullable = false)
    private String otpHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_method", nullable = false, length = 15)
    private AuthMethod authMethod = AuthMethod.OTP;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean verified = false;

    /**
     * Wrong-OTP attempt counter. Lock after 5 failed attempts
     * to prevent brute-force on the 6-digit space.
     */
    @Column(nullable = false)
    private int attempts = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum AuthMethod {
        OTP,
        MISSED_CALL
    }

    // ─── Getters & Setters ───────────────────────────────────────────────

    public UUID getId() { return id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }

    public AuthMethod getAuthMethod() { return authMethod; }
    public void setAuthMethod(AuthMethod authMethod) { this.authMethod = authMethod; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) { this.attempts = attempts; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}