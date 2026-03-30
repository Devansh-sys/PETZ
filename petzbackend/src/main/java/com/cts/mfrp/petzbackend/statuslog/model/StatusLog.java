// FILE: statuslog/model/StatusLog.java
package com.cts.mfrp.petzbackend.statuslog.model;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Audit trail for every status change on a SosReport.
 * One row is inserted each time currentStatus changes.
 * e.g. REPORTED → DISPATCHED → ON_SITE → TRANSPORTING → COMPLETE
 */
@Entity
@Table(name = "status_logs", indexes = {
        @Index(name = "idx_status_log_sos",        columnList = "sos_report_id"),
        @Index(name = "idx_status_log_changed_at",  columnList = "changed_at")
})
public class StatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    /** The SOS report this log entry belongs to */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sos_report_id", nullable = false)
    private SosReport sosReport;

    /** The status value recorded at this point in time */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private ReportStatus status;

    /** Optional note — e.g. "Volunteer arrived on scene", "Handed to City Vet Hospital" */
    @Column(length = 255)
    private String note;

    /** FK → users.id — who triggered this status change (volunteer, admin, system) */
    @Column(name = "changed_by")
    private UUID changedBy;

    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        this.changedAt = LocalDateTime.now();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public UUID getId() { return id; }

    public SosReport getSosReport() { return sosReport; }
    public void setSosReport(SosReport sosReport) { this.sosReport = sosReport; }

    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public UUID getChangedBy() { return changedBy; }
    public void setChangedBy(UUID changedBy) { this.changedBy = changedBy; }

    public LocalDateTime getChangedAt() { return changedAt; }
}