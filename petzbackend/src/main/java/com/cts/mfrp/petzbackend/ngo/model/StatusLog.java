package com.cts.mfrp.petzbackend.ngo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class StatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long missionId;
    private String status;
    private LocalDateTime updatedAt;

    // Constructors
    public StatusLog() {}

    public StatusLog(Long missionId, String status, LocalDateTime updatedAt) {
        this.missionId = missionId;
        this.status = status;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMissionId() { return missionId; }
    public void setMissionId(Long missionId) { this.missionId = missionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
