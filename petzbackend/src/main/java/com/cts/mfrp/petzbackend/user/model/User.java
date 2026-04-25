package com.cts.mfrp.petzbackend.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * FOUNDATION ENTITY — Maps to USERS table from the PETZ schema.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  TEAMMATES: This entity is the SINGLE source of truth   │
 * │  for the USERS table. Do NOT create a duplicate.        │
 * │  Import this class from user.model package.             │
 * └─────────────────────────────────────────────────────────┘
 *
 * Schema columns:
 *   uuid    id          PK
 *   string  role        REPORTER | VOLUNTEER | NGO_REP | VET | ADMIN | ADOPTER
 *   string  full_name
 *   string  phone       Verified via OTP/Missed Call
 *   string  email       Unique
 *   string  password    BCrypt hashed (null for temp reporter accounts)
 *   datetime created_at
 *
 * Epic 4.1 additions (all nullable/defaulted — existing rows stay valid):
 *   int       failed_login_attempts  US-4.1.2 lockout counter
 *   datetime  locked_until           US-4.1.2 lockout expiry
 *   datetime  last_login_at          US-4.1.2 diagnostic
 *   string    profile_photo_url      US-4.1.4 profile photo
 *   boolean   email_verified         US-4.1.1 / US-4.1.4 re-verify on change
 *   boolean   phone_verified         US-4.1.1 / US-4.1.4 re-verify on change
 *   boolean   active                 US-4.1.3 soft-disable (dispute SUSPEND, admin action)
 *   text      notification_prefs     Epic 4.2 JSON opt-outs per channel
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_phone", columnList = "phone", unique = true),
        @Index(name = "idx_users_email", columnList = "email", unique = true),
        @Index(name = "idx_users_role", columnList = "role")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "full_name")
    private String fullName;

    @Column(nullable = false, unique = true, length = 15)
    private String phone;

    @Column(unique = true)
    private String email;

    /**
     * BCrypt hashed password.
     * NULL for temporary reporter accounts created via SOS OTP flow.
     * Set when user does full registration (US-4.1.1) or post-rescue conversion.
     */
    @Column(name = "password")
    private String passwordHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Indicates whether this is a temporary account created during SOS flow.
     * Temporary accounts have limited permissions and can be converted to full
     * accounts via post-rescue conversion (US-1.7.1).
     */
    @Column(name = "is_temporary", nullable = false)
    private boolean isTemporary = false;

    /**
     * Epic 2 (Pet Adoption) — nullable FK to the NGO this user represents.
     * Populated only for role=NGO_REP users so the adoption module can read
     * the caller's ngo from their authenticated principal instead of trusting
     * a client-supplied value. Remains null for REPORTER / ADOPTER / VET /
     * ADMIN users. Additive change — existing rows keep working unchanged.
     */
    @Column(name = "ngo_id")
    private UUID ngoId;

    // ═══════════════════════════════════════════════════════════════════════
    //  Epic 4.1 — Identity & Security additions (all nullable/defaulted)
    // ═══════════════════════════════════════════════════════════════════════

    /** US-4.1.2 AC#5 — consecutive failed login attempts; resets on success. */
    @Column(name = "failed_login_attempts", columnDefinition = "int default 0")
    private Integer failedLoginAttempts;

    /** US-4.1.2 AC#5 — when non-null and in the future, logins are refused. */
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    /** US-4.1.2 — diagnostic timestamp of most recent successful login. */
    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    /** US-4.1.4 — profile photo URL (stored by FileStorageService). */
    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    /** US-4.1.1 AC#3 / US-4.1.4 — flipped false on email change; verification flow re-confirms. */
    @Column(name = "email_verified", columnDefinition = "bit(1) default 0")
    private Boolean emailVerified;

    /** US-4.1.1 AC#2 / US-4.1.4 — flipped false on phone change; re-verified via OTP. */
    @Column(name = "phone_verified", columnDefinition = "bit(1) default 0")
    private Boolean phoneVerified;

    /**
     * US-4.1.3 / US-2.6.3 — soft-disable flag. Inactive users cannot log in.
     * Defaults to true for new rows; existing rows treated as active via
     * {@link #isActiveSafe()} (nullable in DB so old rows remain valid).
     */
    @Column(name = "active", columnDefinition = "bit(1) default 1")
    private Boolean active;

    /** Epic 4.2 (future phase) — JSON of opt-outs per channel (PUSH/SMS/EMAIL/INAPP). */
    @Column(name = "notification_prefs", columnDefinition = "TEXT")
    private String notificationPrefs;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.failedLoginAttempts == null) this.failedLoginAttempts = 0;
        if (this.emailVerified == null)       this.emailVerified       = false;
        if (this.phoneVerified == null)       this.phoneVerified       = false;
        if (this.active == null)              this.active              = true;
    }

    /**
     * All user roles across the PETZ platform.
     * Used by Spring Security for RBAC (US-4.1.3).
     */
    public enum Role {
        REPORTER,    // Public reporter (SOS module)
        VOLUNTEER,   // Legacy — kept for schema compatibility, not actively used
        NGO_REP,     // NGO representative (rescue operations)
        VET,         // Veterinarian / hospital staff
        ADMIN,       // Platform administrator
        ADOPTER      // Adoption module user
    }

    // ─── Constructors ────────────────────────────────────────────────────

    public User() {}

    /**
     * Factory: Create a temporary reporter account during SOS OTP auth.
     * US-1.1.2, US-1.1.4
     */
    public static User createTemporaryReporter(String phone) {
        User user = new User();
        user.phone = phone;
        user.role = Role.REPORTER;
        user.isTemporary = true;
        user.phoneVerified = true;   // OTP verified before creation
        user.active = true;
        return user;
    }

    // ─── Getters & Setters ───────────────────────────────────────────────

    public UUID getId() { return id; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public boolean isTemporary() { return isTemporary; }
    public void setTemporary(boolean temporary) { isTemporary = temporary; }

    public UUID getNgoId() { return ngoId; }
    public void setNgoId(UUID ngoId) { this.ngoId = ngoId; }

    // ─── Epic 4.1 getters & setters ──────────────────────────────────────

    public Integer getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(Integer v) { this.failedLoginAttempts = v; }

    public LocalDateTime getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(LocalDateTime v) { this.lockedUntil = v; }

    public LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(LocalDateTime v) { this.lastLoginAt = v; }

    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String v) { this.profilePhotoUrl = v; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean v) { this.emailVerified = v; }

    public Boolean getPhoneVerified() { return phoneVerified; }
    public void setPhoneVerified(Boolean v) { this.phoneVerified = v; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean v) { this.active = v; }

    public String getNotificationPrefs() { return notificationPrefs; }
    public void setNotificationPrefs(String v) { this.notificationPrefs = v; }

    // ─── Null-safe helpers ───────────────────────────────────────────────

    /** Treats null as true so existing rows (pre-Epic-4) stay active. */
    public boolean isActiveSafe() { return !Boolean.FALSE.equals(active); }

    /** Treats null/absent as false. */
    public boolean isEmailVerifiedSafe() { return Boolean.TRUE.equals(emailVerified); }

    /** Treats null/absent as false. */
    public boolean isPhoneVerifiedSafe() { return Boolean.TRUE.equals(phoneVerified); }

    /** US-4.1.2 AC#5 — is the account currently locked? */
    public boolean isLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }
}
