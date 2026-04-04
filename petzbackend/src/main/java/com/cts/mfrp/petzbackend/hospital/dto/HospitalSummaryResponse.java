
// ─────────────────────────────────────────────
// FILE 13: hospital/dto/HospitalSummaryResponse.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data @Builder
public class HospitalSummaryResponse {
    private UUID    id;
    private String  name;
    private String  address;
    private String  city;
    private String  contactPhone;
    private String  operatingHours;
    private boolean emergencyReady;
    private boolean isOpenNow;
    private boolean isVerified;
    private double  distanceKm;
    private int     serviceCount;
}
