

// ============================================================
// FILE 15: rescue/dto/NearbyHospitalResponse.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class NearbyHospitalResponse {

    private UUID hospitalId;
    private String name;
    private double distanceKm;
    private String services;
    private boolean emergencyReady;
}
