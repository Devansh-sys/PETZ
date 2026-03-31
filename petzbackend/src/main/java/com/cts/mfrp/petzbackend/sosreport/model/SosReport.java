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
@Table(name = "sos_reports")
public class SosReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Column(name = "assigned_animal_id")
    private UUID assignedAnimalId;

    @OneToMany(mappedBy = "sosReport", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SosMedia> mediaFiles = new ArrayList<>();

    @OneToMany(mappedBy = "sosReport", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StatusLog> statusLogs = new ArrayList<>();

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", nullable = false, length = 10)
    private UrgencyLevel urgencyLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 15)
    private ReportStatus currentStatus;

    @Column(length = 500)
    private String description;

    @Column(name = "reported_at", nullable = false, updatable = false)
    private LocalDateTime reportedAt;

    @PrePersist
    protected void onCreate() {
        this.reportedAt = LocalDateTime.now();
        if (this.currentStatus == null) {
            this.currentStatus = ReportStatus.REPORTED;
        }
    }

    public void addMedia(SosMedia media) {
        mediaFiles.add(media);
        media.setSosReport(this);
    }

    public void addStatusLog(StatusLog log) {
        statusLogs.add(log);
        log.setSosReport(this);
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public UUID getId() { return id; }

    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }

    public UUID getAssignedAnimalId() { return assignedAnimalId; }
    public void setAssignedAnimalId(UUID assignedAnimalId) { this.assignedAnimalId = assignedAnimalId; }

    public List<SosMedia> getMediaFiles() { return mediaFiles; }
    public void setMediaFiles(List<SosMedia> mediaFiles) { this.mediaFiles = mediaFiles; }

    public List<StatusLog> getStatusLogs() { return statusLogs; }
    public void setStatusLogs(List<StatusLog> statusLogs) { this.statusLogs = statusLogs; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public UrgencyLevel getUrgencyLevel() { return urgencyLevel; }
    public void setUrgencyLevel(UrgencyLevel urgencyLevel) { this.urgencyLevel = urgencyLevel; }

    public ReportStatus getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(ReportStatus currentStatus) { this.currentStatus = currentStatus; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getReportedAt() { return reportedAt; }
}