package com.cts.mfrp.petzbackend.adoption.model;

import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Immutable audit row for every adoption-module state change.
 *
 * Used across all three waves:
 *   Wave 1 — US-2.2.2 "Audit log per edit" on AdoptablePet updates.
 *   Wave 2 — US-2.4.3 / 2.4.4 / 2.4.5 / 2.4.6 decision trail.
 *   Wave 3 — US-2.5.2 finalization, US-2.6.2 NGO verify actions.
 *
 * Shape mirrors {@code hospital/model/HospitalAuditLog} so reviewers have
 * a familiar template. {@code targetType} + {@code targetId} let one table
 * serve pet listings, applications, adoptions, NGOs and disputes without
 * schema duplication.
 */
@Entity
@Table(
        name = "adoption_audit_logs",
        indexes = {
                @Index(name = "idx_adoption_audit_target",
                       columnList = "target_type,target_id"),
                @Index(name = "idx_adoption_audit_actor",
                       columnList = "actor_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    private AuditTargetType targetType;

    /** UUID of the row being acted on (AdoptablePet id, application id, etc.). */
    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    /** Who did the action — nullable for system-triggered rows. */
    @Column(name = "actor_id")
    private UUID actorId;

    /** Short action code, e.g. LISTING_CREATED, LISTING_UPDATED, ARCHIVED. */
    @Column(nullable = false, length = 64)
    private String action;

    /** Human-readable reason / notes — shown to reviewers and adopters. */
    @Column(length = 1000)
    private String reason;

    /**
     * Optional short JSON blob with a diff summary (changed fields, etc.).
     * Kept as a column, not a separate table, to keep Wave 1 simple.
     */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "performed_at", nullable = false, updatable = false)
    private LocalDateTime performedAt;

    @PrePersist
    protected void onCreate() {
        if (this.performedAt == null) this.performedAt = LocalDateTime.now();
    }
}
