package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * US-3.2.4 AC#2 — "Emergency toggle".
 * Body for PATCH /api/v1/hospitals/{id}/emergency-status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyStatusRequest {
    @NotNull(message = "emergencyReady is required")
    private Boolean emergencyReady;
}
