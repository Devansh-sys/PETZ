package com.cts.mfrp.petzbackend.hospital.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("isOpenNow")
    private boolean               isOpenNow;
    @JsonProperty("isVerified")
    private boolean               isVerified;
    private double                distanceKm;
    private List<DoctorResponse>  doctors;
    private List<ServiceResponse> services;
}
