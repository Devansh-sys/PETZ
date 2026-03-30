package com.cts.mfrp.petzbackend.ngo.dto;

import java.time.LocalDateTime;

public class MissionResponseDTO {
    private Long missionId;
    private Long assignedNgoId;
    private String status;
    private LocalDateTime acceptedAt;

    public MissionResponseDTO() {}

    public MissionResponseDTO(Long missionId, Long assignedNgoId, String status, LocalDateTime acceptedAt) {
        this.missionId = missionId;
        this.assignedNgoId = assignedNgoId;
        this.status = status;
        this.acceptedAt = acceptedAt;
    }

    // Getters and Setters
    public Long getMissionId() { return missionId; }
    public void setMissionId(Long missionId) { this.missionId = missionId; }

    public Long getAssignedNgoId() { return assignedNgoId; }
    public void setAssignedNgoId(Long assignedNgoId) { this.assignedNgoId = assignedNgoId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }
}

