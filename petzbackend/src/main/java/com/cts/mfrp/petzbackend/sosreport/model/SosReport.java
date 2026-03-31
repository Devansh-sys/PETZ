package com.cts.mfrp.petzbackend.sosreport.model;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;
import com.cts.mfrp.petzbackend.sosmedia.model.SosMedia;
import com.cts.mfrp.petzbackend.statuslog.model.StatusLog;
import com.cts.mfrp.petzbackend.user.model.User;       // ← adjust if your User is elsewhere
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sos_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SosReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // FK → users table
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    // Linked to PETS after intake — null at creation time
    @Column(name = "assigned_animal_id")
    private UUID assignedAnimalId;

    // Auto-captured GPS
    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    // USER STORY 1: Mandatory triage — CRITICAL | MODERATE | LOW
    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", nullable = false)
    private UrgencyLevel urgencyLevel;

    // Lifecycle state
    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false)
    private ReportStatus currentStatus;

    // USER STORY 3: Optional descriptive notes (max 500 chars)
    @Column(length = 500)
    private String description;

    @Column(name = "reported_at", updatable = false)
    private LocalDateTime reportedAt;

    // One report → many media files
    @OneToMany(mappedBy = "sosReport", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SosMedia> mediaFiles = new ArrayList<>();

    // One report → many status log entries
    @OneToMany(mappedBy = "sosReport", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StatusLog> statusLogs = new ArrayList<>();

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
}