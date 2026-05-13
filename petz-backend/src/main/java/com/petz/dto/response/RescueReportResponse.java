package com.petz.dto.response;

import com.petz.entity.Ngo;
import com.petz.entity.RescueReport;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RescueReportResponse {

    private Long id;
    private Long reporterId;
    private String reporterPhone;
    private Long assignedNgo;
    private String animalType;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
    private String photoUrl;
    private String status;
    private String criticality;
    private String resolutionNotes;
    private LocalDateTime reportedAt;
    private LocalDateTime updatedAt;

    // Enriched NGO fields
    private String ngoName;
    private String ngoPhone;
    private String ngoEmail;
    private String ngoCity;
    private String ngoAddress;

    public static RescueReportResponse from(RescueReport r, Ngo ngo) {
        RescueReportResponse res = new RescueReportResponse();
        res.setId(r.getId());
        res.setReporterId(r.getReporterId());
        res.setReporterPhone(r.getReporterPhone());
        res.setAssignedNgo(r.getAssignedNgo());
        res.setAnimalType(r.getAnimalType());
        res.setDescription(r.getDescription());
        res.setLatitude(r.getLatitude());
        res.setLongitude(r.getLongitude());
        res.setAddress(r.getAddress());
        res.setPhotoUrl(r.getPhotoUrl());
        res.setStatus(r.getStatus() != null ? r.getStatus().name() : null);
        res.setCriticality(r.getCriticality() != null ? r.getCriticality().name() : null);
        res.setResolutionNotes(r.getResolutionNotes());
        res.setReportedAt(r.getReportedAt());
        res.setUpdatedAt(r.getUpdatedAt());

        if (ngo != null) {
            res.setNgoName(ngo.getName());
            res.setNgoPhone(ngo.getPhone());
            res.setNgoEmail(ngo.getEmail());
            res.setNgoCity(ngo.getCity());
            res.setNgoAddress(ngo.getAddress());
        }
        return res;
    }
}
