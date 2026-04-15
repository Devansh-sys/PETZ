package com.cts.mfrp.petzbackend.hospital.dto;

import com.cts.mfrp.petzbackend.hospital.model.Hospital;
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
    private boolean isVerified;
    private boolean emergencyReady;
    private boolean isOpenNow;
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
                .isVerified(h.isVerified())
                .emergencyReady(h.isEmergencyReady())
                .isOpenNow(h.isOpenNow())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
