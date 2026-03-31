package com.cts.mfrp.petzbackend.rescue.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Column(name = "assigned_animal_id")
    private UUID assignedAnimalId;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", nullable = false)
    private com.cts.mfrp.petzbackend.rescue.model.SosReport.UrgencyLevel urgencyLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false)
    private com.cts.mfrp.petzbackend.rescue.model.SosReport.RescueStatus currentStatus;

    @Column(name = "reported_at", nullable = false)
    private LocalDateTime reportedAt;

    public enum UrgencyLevel {
        CRITICAL, MODERATE, LOW
    }

    public enum RescueStatus {
        REPORTED, DISPATCHED, ON_SITE, TRANSPORTING,
        PENDING_CLOSURE, HANDED_OVER, MISSION_COMPLETE, CLOSED
    }
}
