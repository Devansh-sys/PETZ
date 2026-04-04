
// ─────────────────────────────────────────────
// FILE 15: hospital/dto/HospitalFilterRequest.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.dto;

import lombok.Data;

@Data
public class HospitalFilterRequest {
    private String  name;
    private String  city;
    private String  serviceType;
    private Boolean emergencyReady;
    private Boolean openNow;
    private Double  userLatitude;
    private Double  userLongitude;
}
