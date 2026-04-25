package com.cts.mfrp.petzbackend.ngo.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
public class Ngo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private double latitude;
    private double longitude;
    private boolean active;

    /**
     * US-2.6.2 — admin-verified badge. Added for Epic 2 Wave 3.
     * Nullable/default=false so existing rows keep working; admin flips
     * this via {@code POST /admin/adoptions/ngos/{id}/verify}.
     */
    /** US-2.6.2 — admin-verified flag. Stored as nullable bit; treated as false when null. */
    @Column(name = "is_verified", columnDefinition = "bit(1) default 0")
    private Boolean isVerified;

    /**
     * US-2.6.2 / Wave 3 — the User account that owns / represents the NGO
     * (typically an NGO_REP with {@code User.ngoId} pointing back).
     * Nullable to preserve existing NGO rows. Admin sets this when
     * approving an NGO registration.
     */
    @Column(name = "owner_user_id")
    private UUID ownerUserId;

    // ── Phase 3 (Epic 4.3) — NGO self-registration fields ───────────────
    // All nullable so existing rows are untouched by ddl-auto=update.

    /** Primary contact email for the NGO (public-facing). */
    @Column(name = "contact_email", length = 200)
    private String contactEmail;

    /** Primary contact phone for the NGO. */
    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    /** Street / locality address of the NGO office. */
    @Column(name = "address", length = 500)
    private String address;

    /** Optional government / trust registration number. */
    @Column(name = "registration_number", length = 100)
    private String registrationNumber;

    /** Short description of the NGO's mission and species focus. */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** Timestamp the NGO row was first created. */
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @jakarta.persistence.PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = java.time.LocalDateTime.now();
    }

    // Constructors
    public Ngo() {}

    public Ngo(String name, double latitude, double longitude, boolean active) {
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.active = active;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    /** Returns true only if explicitly set to true; treats null as false. */
    public boolean isVerified() { return Boolean.TRUE.equals(isVerified); }
    public void setVerified(boolean verified) { this.isVerified = verified; }

    public UUID getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(UUID ownerUserId) { this.ownerUserId = ownerUserId; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
}
