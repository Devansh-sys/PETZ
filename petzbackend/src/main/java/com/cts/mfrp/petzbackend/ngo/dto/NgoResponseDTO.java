package com.cts.mfrp.petzbackend.ngo.dto;

public class NgoResponseDTO {
    private Long ngoId;
    private String name;
    private double distance;   // distance from SOS location
    private String status;     // e.g., NOTIFIED, ACCEPTED, DECLINED

    public NgoResponseDTO() {}

    public NgoResponseDTO(Long ngoId, String name, double distance, String status) {
        this.ngoId = ngoId;
        this.name = name;
        this.distance = distance;
        this.status = status;
    }

    // Getters and Setters
    public Long getNgoId() { return ngoId; }
    public void setNgoId(Long ngoId) { this.ngoId = ngoId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
