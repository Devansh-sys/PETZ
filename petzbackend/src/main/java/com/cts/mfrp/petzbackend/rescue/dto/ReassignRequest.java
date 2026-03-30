package com.cts.mfrp.petzbackend.rescue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class ReassignRequest {

    @NotNull(message = "New NGO ID is required")
    private UUID newNgoId;

    @NotNull(message = "New volunteer ID is required")
    private UUID newVolunteerId;

    @NotBlank(message = "Reason for reassignment is required")
    private String reason;

    public UUID getNewNgoId()          { return newNgoId; }
    public void setNewNgoId(UUID v)    { this.newNgoId = v; }

    public UUID getNewVolunteerId()       { return newVolunteerId; }
    public void setNewVolunteerId(UUID v) { this.newVolunteerId = v; }

    public String getReason()          { return reason; }
    public void setReason(String v)    { this.reason = v; }
}
