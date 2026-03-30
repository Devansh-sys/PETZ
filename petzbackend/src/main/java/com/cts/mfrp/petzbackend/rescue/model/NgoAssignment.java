
package com.cts.mfrp.petzbackend.rescue.model;

import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ngo_assignments", indexes = {
        @Index(name = "idx_ngo_assignments_sos",       columnList = "sos_report_id"),
        @Index(name = "idx_ngo_assignments_volunteer", columnList = "volunteer_id"),
        @Index(name = "idx_ngo_assignments_status",    columnList = "assignment_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NgoAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** FK → sos_reports */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sos_report_id", nullable = false)
    private SosReport sosReport;

    /** FK → ngos table (ngo entity owned by ngo module) */
    @Column(name = "ngo_id", nullable = false)
    private UUID ngoId;

    /** FK → users (NGO representative — role = NGO_REP) */
    @Column(name = "volunteer_id")
    private UUID volunteerId;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_status", nullable = false, length = 20)
    private AssignmentStatus assignmentStatus;

    // ── Reassignment audit fields (US-1.8.2) ─────────────────────────────────

    /** Human-readable reason entered by admin during reassignment */
    @Column(name = "reassignment_reason", columnDefinition = "TEXT")
    private String reassignmentReason;

    /** FK → users (admin who triggered the reassignment) */
    @Column(name = "reassigned_by")
    private UUID reassignedBy;

    @Column(name = "reassigned_at")
    private LocalDateTime reassignedAt;

    @PrePersist
    protected void onCreate() {
        this.assignedAt = LocalDateTime.now();
        if (this.assignmentStatus == null) {
            this.assignmentStatus = AssignmentStatus.PENDING;
        }
    }

    public enum AssignmentStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        ARRIVED,
        REASSIGNED
    }
}