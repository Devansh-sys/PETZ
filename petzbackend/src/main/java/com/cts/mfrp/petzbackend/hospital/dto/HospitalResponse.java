package com.cts.mfrp.petzbackend.hospital.dto;

import com.cts.mfrp.petzbackend.hospital.model.Hospital;
<<<<<<< Updated upstream
=======
import com.fasterxml.jackson.annotation.JsonProperty;
>>>>>>> Stashed changes
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalResponse {

    private UUID id;
    private UUID ownerId;
    private String name;
    private String address;
    private String city;
    private String contactPhone;
    private String contactEmail;
    private String operatingHours;
    /** Structured per-day hours JSON (US-3.2.4 AC#1). Null until first update. */
    private String operatingHoursJson;
<<<<<<< Updated upstream
    private boolean isVerified;
    private boolean emergencyReady;
=======
    @JsonProperty("isVerified")
    private boolean isVerified;
    private boolean emergencyReady;
    @JsonProperty("isOpenNow")
>>>>>>> Stashed changes
    private boolean isOpenNow;
    /**
     * US-3.2.1 AC#3 — "Status: Pending" — derived from isVerified.
     * PENDING until a platform admin verifies; VERIFIED afterwards.
     * Useful for clients that prefer a textual state over the boolean.
     */
    private String status;
    private LocalDateTime createdAt;

    public static HospitalResponse from(Hospital h) {
        return HospitalResponse.builder()
                .id(h.getId())
                .ownerId(h.getOwnerId())
                .name(h.getName())
                .address(h.getAddress())
                .city(h.getCity())
                .contactPhone(h.getContactPhone())
                .contactEmail(h.getContactEmail())
                .operatingHours(h.getOperatingHours())
                .operatingHoursJson(h.getOperatingHoursJson())
                .isVerified(h.isVerified())
                .emergencyReady(h.isEmergencyReady())
                .isOpenNow(h.isOpenNow())
                .status(h.isVerified() ? "VERIFIED" : "PENDING")
                .createdAt(h.getCreatedAt())
                .build();
    }
}
