package com.cts.mfrp.petzbackend.adoption.model;

import com.cts.mfrp.petzbackend.adoption.enums.AdoptablePetStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Epic 2.1 + 2.2 — Pet listing available for adoption.
 *
 *   US-2.1.1 Browse adoptable pets (catalog card fields)
 *   US-2.1.4 View pet detail profile (rich fields)
 *   US-2.2.1 Create pet listing (all fields populated by NGO form)
 *   US-2.2.2 Update pet profile
 *   US-2.2.4 Deactivate/archive listing (status=ARCHIVED)
 *
 * Owned by an NGO (ngoId FK). Lifecycle tracked via {@link AdoptablePetStatus}.
 * Distinct from the hospital-module {@code Pet} entity — that represents an
 * adopter-OWNED pet; AdoptablePet represents an NGO-HELD pet waiting for
 * adoption. Bridge happens in Wave 3: on adoption completion, we INSERT a
 * new hospital {@code Pet} row for the adopter and flip this row to ADOPTED.
 */
@Entity
@Table(
        name = "adoptable_pets",
        indexes = {
                @Index(name = "idx_adoptable_pets_ngo", columnList = "ngo_id"),
                @Index(name = "idx_adoptable_pets_status", columnList = "status"),
                @Index(name = "idx_adoptable_pets_species", columnList = "species")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptablePet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    /** FK to {@code ngos.id}; the NGO that holds and lists the pet. */
    @Column(name = "ngo_id", nullable = false)
    private UUID ngoId;

    // ── Catalog-card fields (US-2.1.1) ───────────────────────────────
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String species;                 // DOG, CAT, BIRD, ... (free-text for flexibility)

    @Column
    private String breed;

    /** M / F / UNKNOWN — kept as String so clients can send any label. */
    @Column(length = 16)
    private String gender;

    /** Age in months — integer keeps arithmetic trivial. Nullable for "Unknown age". */
    @Column(name = "age_months")
    private Integer ageMonths;

    /** SMALL / MEDIUM / LARGE — optional metadata for filters. */
    @Column(name = "size_category", length = 16)
    private String sizeCategory;

    @Column
    private String color;

    // ── Detail-profile fields (US-2.1.4 / US-2.2.1) ──────────────────
    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Behavioral notes / temperament summary (US-2.1.4 "behavioral notes"). */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String temperament;

    /** Medical history summary (US-2.1.4 "medical history"). */
    @Lob
    @Column(name = "medical_summary", columnDefinition = "TEXT")
    private String medicalSummary;

    /** Free text like "Fully vaccinated" / "2 of 3 shots". */
    @Column(name = "vaccination_status")
    private String vaccinationStatus;

    /** Whether the pet has any special care needs (US-2.1.2 filter). */
    @Column(name = "special_needs", nullable = false)
    private boolean specialNeeds;

    @Lob
    @Column(name = "special_needs_notes", columnDefinition = "TEXT")
    private String specialNeedsNotes;

    // ── Location (US-2.1.1 "location", US-2.1.3 "Nearest" sort) ──────
    @Column(name = "location_city")
    private String locationCity;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    // ── Lifecycle (US-2.2.1 AC#4, US-2.1.1 AC#3, US-2.2.4) ───────────
    /** US-2.2.1 AC#4 — readiness badge the adopter sees (US-2.1.1 AC#2). */
    @Column(name = "is_adoption_ready", nullable = false)
    private boolean isAdoptionReady;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private AdoptablePetStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Optimistic lock to guard concurrent NGO edits / archive operations. */
    @Version
    @Column(name = "version")
    private Long version;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
        if (this.status == null)    this.status    = AdoptablePetStatus.LISTED;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
