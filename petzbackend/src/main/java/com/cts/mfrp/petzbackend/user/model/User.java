
// User.java
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
     * Set when user does full registration or post-rescue account conversion.
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

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
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
}
