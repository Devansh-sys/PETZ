
// ============================================================
// FILE 16: rescue/dto/EmergencyBookingRequest.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class EmergencyBookingRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID volunteerId;

    @NotBlank
    private String slotTime; // ISO-8601 datetime string
}
