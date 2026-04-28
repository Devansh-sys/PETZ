package com.cts.mfrp.petzbackend.adoption.model;

import com.cts.mfrp.petzbackend.adoption.enums.FollowUpStatus;
import com.cts.mfrp.petzbackend.adoption.enums.FollowUpType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-2.5.3 + US-2.5.4 — scheduled post-adoption check-in.
 *
 * Three rows auto-created when an Adoption flips to COMPLETED:
 *   DAY_7  dueDate = handoverDate + 7
 *   DAY_30 dueDate = handoverDate + 30
 *   DAY_90 dueDate = handoverDate + 90
 *
 * NGO records outcomes via {@code PATCH /follow-ups/{id}} (US-2.5.4).
 * {@code reminderSentAt} keeps the daily scheduler idempotent —
 * a follow-up is nudged at most once per day.
 */
@Entity
@Table(
        name = "adoption_follow_ups",
        indexes = {
                @Index(name = "idx_followup_adoption", columnList = "adoption_id"),
                @Index(name = "idx_followup_due",      columnList = "due_date,status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionFollowUp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "adoption_id", nullable = false)
    private UUID adoptionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "follow_up_type", nullable = false, length = 10)
    private FollowUpType followUpType;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private FollowUpStatus status;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String notes;

    /** US-2.5.4 AC#4 — flagged items surface in admin dashboard. */
    @Column(name = "concern_flag", nullable = false)
    private boolean concernFlag;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "completed_by")
    private UUID completedBy;

    /** Idempotency marker for the daily reminder scheduler (US-2.5.3 AC#2). */
    @Column(name = "reminder_sent_at")
    private LocalDateTime reminderSentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.status == null)    this.status    = FollowUpStatus.SCHEDULED;
    }
}
