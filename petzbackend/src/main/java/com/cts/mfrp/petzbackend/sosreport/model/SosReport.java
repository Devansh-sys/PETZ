package com.cts.mfrp.petzbackend.sosreport.model;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;
import com.cts.mfrp.petzbackend.sosmedia.model.SosMedia;
import com.cts.mfrp.petzbackend.statuslog.model.StatusLog;
import com.cts.mfrp.petzbackend.user.model.User;
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
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Column(name = "assigned_animal_id")
    private UUID assignedAnimalId;

    @OneToMany(mappedBy = "sosReport", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SosMedia> mediaFiles = new ArrayList<>();

    @OneToMany(mappedBy = "sosReport", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StatusLog> statusLogs = new ArrayList<>();

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", nullable = false, length = 10)
    private UrgencyLevel urgencyLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false, length = 20)
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
}