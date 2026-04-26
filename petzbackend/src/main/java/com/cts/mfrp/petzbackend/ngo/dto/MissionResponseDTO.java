package com.cts.mfrp.petzbackend.ngo.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class MissionResponseDTO {
    private UUID missionId;
    private UUID assignedNgoUserId;
    private String status;
    private LocalDateTime acceptedAt;

    public MissionResponseDTO() {}

    public MissionResponseDTO(UUID missionId, UUID assignedNgoUserId, String status, LocalDateTime acceptedAt) {
        this.missionId = missionId;
        this.assignedNgoUserId = assignedNgoUserId;
        this.status = status;
        this.acceptedAt = acceptedAt;
    }

    // Getters and Setters
    public UUID getMissionId() { return missionId; }
    public void setMissionId(UUID missionId) { this.missionId = missionId; }

    public UUID getAssignedNgoUserId() { return assignedNgoUserId; }
    public void setAssignedNgoUserId(UUID assignedNgoUserId) { this.assignedNgoUserId = assignedNgoUserId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }
}
