package com.cts.mfrp.petzbackend.adoption.model;

import com.cts.mfrp.petzbackend.adoption.enums.AdoptionApplicationStatus;
import com.cts.mfrp.petzbackend.adoption.enums.ApplicationStep;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Epic 2.3 + 2.4 — adopter's application for a specific adoptable pet.
 *
 *   US-2.3.1 Start (DRAFT)
 *   US-2.3.2 Auto-save per step (lastActivityAt refreshed on each PATCH)
 *   US-2.3.3 Submit (DRAFT -> SUBMITTED)
 *   US-2.3.5 Status tracking (status + decisionReason + clarificationQuestions)
 *   US-2.3.6 Withdraw
 *   US-2.4.3 / 2.4.4 / 2.4.5 — NGO approve / reject / clarify
 *
 * Form fields for the multi-step flow are stored as flat columns on this
 * row so the whole application fits in a single table. A second active
 * application for the same (adopterId, petId) is rejected by the service
 * with 409 (US-2.3.1 AC#2 "One active application per user per pet").
 */
@Entity
@Table(
        name = "adoption_applications",
        indexes = {
                @Index(name = "idx_adopt_app_adopter", columnList = "adopter_id"),
                @Index(name = "idx_adopt_app_pet",     columnList = "adoptable_pet_id"),
                @Index(name = "idx_adopt_app_ngo",     columnList = "ngo_id"),
                @Index(name = "idx_adopt_app_status",  columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "adopter_id", nullable = false)
    private UUID adopterId;

    @Column(name = "adoptable_pet_id", nullable = false)
    private UUID adoptablePetId;

    /** Snapshot of the owning NGO at creation time. */
    @Column(name = "ngo_id", nullable = false)
    private UUID ngoId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AdoptionApplicationStatus status;

    /** Last step the adopter PATCHed — drives "resume from same step" UX. */
    @Enumerated(EnumType.STRING)
    @Column(name = "current_step", length = 16)
    private ApplicationStep currentStep;

    // ── Personal section (US-2.3.1) ──────────────────────────────────
    @Column(name = "full_name")           private String fullName;
    @Column(name = "phone")               private String phone;
    @Column(name = "email")               private String email;
    @Column(name = "address_line")        private String addressLine;
    @Column(name = "city")                private String city;
    @Column(name = "pincode", length = 16) private String pincode;

    // ── Lifestyle section ───────────────────────────────────────────
    @Column(name = "housing_type")        private String housingType;   // APARTMENT / HOUSE / OTHER
    @Column(name = "has_yard")            private Boolean hasYard;
    @Column(name = "other_pets_count")    private Integer otherPetsCount;
    @Column(name = "work_schedule_hours") private Integer workScheduleHours;

    // ── Experience section ──────────────────────────────────────────
    @Column(name = "prev_pet_ownership")         private Boolean prevPetOwnership;
    @Lob @Column(name = "prev_pet_details", columnDefinition = "TEXT") private String prevPetDetails;
    @Lob @Column(name = "vet_support",      columnDefinition = "TEXT") private String vetSupport;

    // ── Consent section (US-2.3.3 AC#2 "Mandatory consent checkboxes") ──
    @Column(name = "consent_home_visit")        private Boolean consentHomeVisit;
    @Column(name = "consent_follow_up")         private Boolean consentFollowUp;
    @Column(name = "consent_background_check")  private Boolean consentBackgroundCheck;

    // ── NGO comms ───────────────────────────────────────────────────
    /** Reason recorded by NGO on REJECTED / final decisions (US-2.4.4). */
    @Lob
    @Column(name = "decision_reason", columnDefinition = "TEXT")
    private String decisionReason;

    /** Latest clarification questions from the NGO (US-2.4.5). */
    @Lob
    @Column(name = "clarification_questions", columnDefinition = "TEXT")
    private String clarificationQuestions;

    // ── Timestamps + optimistic lock ────────────────────────────────
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Refreshed on every adopter PATCH; used by the 30-day inactivity
     *  rule in US-2.3.2 AC#3. (Cleanup job arrives in a future epic.) */
    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;

    /** Timestamp when adopter submitted — drives US-2.3.5 history. */
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    /** Timestamp of the final decision (APPROVED / REJECTED / WITHDRAWN). */
    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @Version
    @Column(name = "version")
    private Long version;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null)      this.createdAt = now;
        if (this.updatedAt == null)      this.updatedAt = now;
        if (this.lastActivityAt == null) this.lastActivityAt = now;
        if (this.status == null)         this.status = AdoptionApplicationStatus.DRAFT;
        if (this.currentStep == null)    this.currentStep = ApplicationStep.PERSONAL;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
