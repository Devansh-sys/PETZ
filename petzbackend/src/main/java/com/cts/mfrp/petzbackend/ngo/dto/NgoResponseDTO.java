package com.cts.mfrp.petzbackend.ngo.dto;

import java.util.UUID;

public class NgoResponseDTO {
    private UUID ngoId;
    private String name;
    private double distance;   // distance from SOS location
    private String status;     // e.g., NOTIFIED, ACCEPTED, DECLINED

    public NgoResponseDTO() {}

    public NgoResponseDTO(UUID ngoId, String name, double distance, String status) {
        this.ngoId = ngoId;
        this.name = name;
        this.distance = distance;
        this.status = status;
    }

    // Getters and Setters
    public UUID getNgoId() { return ngoId; }
    public void setNgoId(UUID ngoId) { this.ngoId = ngoId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
