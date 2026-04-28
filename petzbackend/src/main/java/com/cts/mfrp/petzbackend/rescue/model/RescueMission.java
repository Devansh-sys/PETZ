package com.cts.mfrp.petzbackend.rescue.model;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import com.cts.mfrp.petzbackend.user.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rescue_missions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueMission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sos_report_id", nullable = false, unique = true)
    private SosReport sosReport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_ngo_user_id")
    private User assignedNgoUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "rescue_status", nullable = false)
    private ReportStatus rescueStatus;

    @Column(name = "eta_minutes")
    private Integer etaMinutes;



    @Column(name = "sos_lat")
    private Double sosLat;

    @Column(name = "sos_lon")
    private Double sosLon;

    @Column(name = "severity_level")
    private Integer severityLevel;

    @Column(name = "assigned_ngo_id")
    private UUID assignedNgoId;

    @Column(name = "ngo_status")
    private String ngoStatus;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @ElementCollection
    @CollectionTable(name = "rescue_mission_declined_ngos", joinColumns = @JoinColumn(name = "rescue_mission_id"))
    @Column(name = "ngo_id")
    @Builder.Default
    private List<UUID> declinedNgoIds = new ArrayList<>();

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(name = "on_site_at")
    private LocalDateTime onSiteAt;

    @Column(name = "transporting_at")
    private LocalDateTime transportingAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
