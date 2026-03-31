package com.cts.mfrp.petzbackend.statuslog.model;

import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "status_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sos_report_id", nullable = false)
    private SosReport sosReport;

    @Column(nullable = false)
    private String status;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.updatedAt = LocalDateTime.now();
    }
}