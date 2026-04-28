package com.cts.mfrp.petzbackend.adoption.model;

import com.cts.mfrp.petzbackend.adoption.enums.DisputeStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-2.6.3 — dispute raised by an adopter or NGO about a completed
 * adoption. Admin triages via {@code /admin/adoptions/disputes}.
 *
 * Kept lightweight (queue + resolution note) per the plan; escalation
 * chains / SLAs are explicit out-of-scope.
 */
@Entity
@Table(
        name = "adoption_disputes",
        indexes = {
                @Index(name = "idx_dispute_adoption", columnList = "adoption_id"),
                @Index(name = "idx_dispute_status",   columnList = "status")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionDispute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "adoption_id", nullable = false)
    private UUID adoptionId;

    @Column(name = "raised_by_user_id", nullable = false)
    private UUID raisedByUserId;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private DisputeStatus status;

    // ── Admin action ────────────────────────────────────────────────
    /** OVERRIDE / WARN / SUSPEND — recorded when admin resolves. */
    @Column(name = "admin_action", length = 24)
    private String adminAction;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String resolution;

    @Column(name = "resolved_by")
    private UUID resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.status == null)    this.status    = DisputeStatus.OPEN;
    }
}
