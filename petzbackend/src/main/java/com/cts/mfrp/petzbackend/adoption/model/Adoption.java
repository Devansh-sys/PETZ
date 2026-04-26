package com.cts.mfrp.petzbackend.adoption.model;

import com.cts.mfrp.petzbackend.adoption.enums.AdoptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-2.5.1 + US-2.5.2 — immutable-post-finalization record of a completed
 * adoption.
 *
 *   US-2.5.1 — createHandover (applicationId must be APPROVED; status
 *              starts as HANDOVER_SCHEDULED)
 *   US-2.5.2 — confirmHandover (flips to COMPLETED, sets finalizedAt,
 *              becomes IMMUTABLE — service rejects any further writes)
 *
 * One-to-one with {@code AdoptionApplication} via {@code applicationId}
 * (UNIQUE). We snapshot adopterId / ngoId / adoptablePetId at creation
 * so historical queries still work even if those rows are later mutated.
 */
@Entity
@Table(
        name = "adoptions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_adoptions_application",
                                  columnNames = "application_id")
        },
        indexes = {
                @Index(name = "idx_adoptions_adopter", columnList = "adopter_id"),
                @Index(name = "idx_adoptions_ngo",     columnList = "ngo_id"),
                @Index(name = "idx_adoptions_pet",     columnList = "adoptable_pet_id"),
                @Index(name = "idx_adoptions_status",  columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Adoption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "application_id", nullable = false, updatable = false)
    private UUID applicationId;

    @Column(name = "adopter_id", nullable = false, updatable = false)
    private UUID adopterId;

    @Column(name = "ngo_id", nullable = false, updatable = false)
    private UUID ngoId;

    @Column(name = "adoptable_pet_id", nullable = false, updatable = false)
    private UUID adoptablePetId;

    /**
     * US-2.5.5 — once status=COMPLETED, we INSERT a row into the hospital
     * module's {@code pets} table. This column stores the new hospital
     * Pet id so the adopter UI can deep-link to the hospital module.
     */
    @Column(name = "hospital_pet_id")
    private UUID hospitalPetId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private AdoptionStatus status;

    @Column(name = "handover_date")
    private LocalDate handoverDate;

    @Column(name = "handover_location")
    private String handoverLocation;

    /** Set once {@code status} flips to COMPLETED; never changes again. */
    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Version
    @Column(name = "version")
    private Long version;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.status == null)    this.status    = AdoptionStatus.HANDOVER_SCHEDULED;
    }
}
