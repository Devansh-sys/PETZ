package com.cts.mfrp.petzbackend.ngo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Links this mission to the SOS Report that triggered it.
     * Required for status logging against the correct SOS case.
     */
    @Column(name = "sos_report_id")
    private UUID sosReportId;

    private double sosLat;
    private double sosLon;
    private int severityLevel; // 1=Critical, 2=Moderate, 3=Low
    private Long assignedNgoId;
    private String status; // PENDING, ASSIGNED, DECLINED, REDISPATCH, COMPLETED
    private LocalDateTime createdAt;
    private LocalDateTime acceptedAt;

    @ElementCollection
    private List<Long> declinedNgoIds = new ArrayList<>();

    // Constructors
    public Mission() {
        this.createdAt = LocalDateTime.now();
        this.status = "PENDING";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getSosReportId() { return sosReportId; }
    public void setSosReportId(UUID sosReportId) { this.sosReportId = sosReportId; }

    public double getSosLat() { return sosLat; }
    public void setSosLat(double sosLat) { this.sosLat = sosLat; }

    public double getSosLon() { return sosLon; }
    public void setSosLon(double sosLon) { this.sosLon = sosLon; }

    public int getSeverityLevel() { return severityLevel; }
    public void setSeverityLevel(int severityLevel) { this.severityLevel = severityLevel; }

    public Long getAssignedNgoId() { return assignedNgoId; }
    public void setAssignedNgoId(Long assignedNgoId) { this.assignedNgoId = assignedNgoId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }

    public List<Long> getDeclinedNgoIds() { return declinedNgoIds; }
    public void setDeclinedNgoIds(List<Long> declinedNgoIds) { this.declinedNgoIds = declinedNgoIds; }

    public boolean allDeclined() {
        return declinedNgoIds.size() >= 5;
    }
}