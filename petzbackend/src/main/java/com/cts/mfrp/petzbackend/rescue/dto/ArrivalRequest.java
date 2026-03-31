

// ============================================================
// FILE 12: rescue/dto/ArrivalRequest.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ArrivalRequest {

    @NotNull
    private UUID volunteerId;

    @NotNull
    private BigDecimal currentLatitude;

    @NotNull
    private BigDecimal currentLongitude;
}
