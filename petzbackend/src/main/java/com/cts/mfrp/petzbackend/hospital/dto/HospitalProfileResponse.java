
// ─────────────────────────────────────────────
// FILE 14: hospital/dto/HospitalProfileResponse.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data @Builder
public class HospitalProfileResponse {
    private UUID                  id;
    private String                name;
    private String                address;
    private String                city;
    private String                contactPhone;
    private String                contactEmail;
    private String                operatingHours;
    private boolean               emergencyReady;
    private boolean               isOpenNow;
    private boolean               isVerified;
    private double                distanceKm;
    private List<DoctorResponse>  doctors;
    private List<ServiceResponse> services;
}
