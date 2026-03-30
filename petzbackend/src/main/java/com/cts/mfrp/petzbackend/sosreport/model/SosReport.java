// FILE: sosreport/model/SosReport.java
//
// ┌─────────────────────────────────────────────────────────────────┐
// │  FOUNDATION ENTITY — Maps to sos_reports table.                 │
// │  TEAMMATES: Do NOT create a duplicate of this class.            │
// │  Import from com.cts.mfrp.petzbackend.sosreport.model           │
// └─────────────────────────────────────────────────────────────────┘
package com.cts.mfrp.petzbackend.sosreport.model;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;
import com.cts.mfrp.petzbackend.sosmedia.model.SosMedia;
import com.cts.mfrp.petzbackend.statuslog.model.StatusLog;
import com.cts.mfrp.petzbackend.user.model.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sos_reports", indexes = {
        @Index(name = "idx_sos_reporter",       columnList = "reporter_id"),
        @Index(name = "idx_sos_status",         columnList = "current_status"),
        @Index(name = "idx_sos_urgency",        columnList = "urgency_level"),
        @Index(name = "idx_sos_reported_at",    columnList = "reported_at")
})
public class SosReport {

    // ── Primary Key ───────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    // ── Relationships ─────────────────────────────────────────────────────────

    /**
     * The user who submitted this SOS report.
     * Can be a temporary reporter (isTemporary = true) or a registered user.
     * FK → users.id
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    /**
     * Linked to a PETS animal record after hospital intake.
     * Null at the time of SOS creation — populated later in the workflow.
     * FK → animals.id (animal module)
     */
    @Column(name = "assigned_animal_id")
    private UUID assignedAnimalId;

    /**
     * All photos/videos attached to this SOS report.
     * Max 3 photos OR 1 video — enforced at service layer (FR-2.3).
     * CascadeType.ALL: media is deleted when the report is deleted.
     */
    @OneToMany(mappedBy = "sosReport", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SosMedia> mediaFiles = new ArrayList<>();

    /**
     * Full audit trail of every status change on this report.
     * e.g. REPORTED → DISPATCHED → ON_SITE → TRANSPORTING → COMPLETE
     */
    @OneToMany(mappedBy = "sosReport", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StatusLog> statusLogs = new ArrayList<>();

    // ── Location ──────────────────────────────────────────────────────────────

    /**
     * GPS coordinates auto-captured at SOS initiation (FR-2.2).
     * BigDecimal used for precision — double/float lose decimal accuracy at scale.
     * precision=10, scale=7 supports coordinates like 13.0827263 (Chennai latitude).
     */
    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    // ── Triage & Status ───────────────────────────────────────────────────────

    /**
     * Severity level selected by the reporter during SOS flow (FR-2.4).
     * CRITICAL | MODERATE | LOW
     * Controls volunteer routing radius and notification intensity.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", nullable = false, length = 10)
    private UrgencyLevel urgencyLevel;

    /**
     * Current lifecycle state of the rescue mission (FR-2.6).
     * REPORTED → DISPATCHED → ON_SITE → TRANSPORTING → COMPLETE
     * Default set in @PrePersist.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 15)
    private ReportStatus currentStatus;

    // ── Optional Fields ───────────────────────────────────────────────────────

    /**
     * Free-text description provided by the reporter.
     * Optional — max 500 characters.
     */
    @Column(length = 500)
    private String description;

    // ── Timestamps ────────────────────────────────────────────────────────────

    /**
     * Set automatically when the record is first persisted.
     * Never updated after that (updatable = false).
     */
    @Column(name = "reported_at", nullable = false, updatable = false)
    private LocalDateTime reportedAt;

    // ── Lifecycle Hooks ───────────────────────────────────────────────────────

    @PrePersist
    protected void onCreate() {
        this.reportedAt = LocalDateTime.now();
        if (this.currentStatus == null) {
            this.currentStatus = ReportStatus.REPORTED;
        }
    }

    // ── Convenience Methods ───────────────────────────────────────────────────

    /**
     * Adds a media file and sets the back-reference so both sides
     * of the bidirectional relationship stay in sync.
     */
    public void addMedia(SosMedia media) {
        mediaFiles.add(media);
        media.setSosReport(this);
    }

    /**
     * Adds a status log entry and sets back-reference.
     */
    public void addStatusLog(StatusLog log) {
        statusLogs.add(log);
        log.setSosReport(this);
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public UUID getId() {
        return id;
    }
    // No setId — UUID is auto-generated, should never be set manually

    public User getReporter() {
        return reporter;
    }
    public void setReporter(User reporter) {
        this.reporter = reporter;
    }

    public UUID getAssignedAnimalId() {
        return assignedAnimalId;
    }
    public void setAssignedAnimalId(UUID assignedAnimalId) {
        this.assignedAnimalId = assignedAnimalId;
    }

    public List<SosMedia> getMediaFiles() {
        return mediaFiles;
    }
    public void setMediaFiles(List<SosMedia> mediaFiles) {
        this.mediaFiles = mediaFiles;
    }

    public List<StatusLog> getStatusLogs() {
        return statusLogs;
    }
    public void setStatusLogs(List<StatusLog> statusLogs) {
        this.statusLogs = statusLogs;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }
    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }
    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public UrgencyLevel getUrgencyLevel() {
        return urgencyLevel;
    }
    public void setUrgencyLevel(UrgencyLevel urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }

    public ReportStatus getCurrentStatus() {
        return currentStatus;
    }
    public void setCurrentStatus(ReportStatus currentStatus) {
        this.currentStatus = currentStatus;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getReportedAt() {
        return reportedAt;
    }
    // No setReportedAt — set automatically by @PrePersist, never manually
}