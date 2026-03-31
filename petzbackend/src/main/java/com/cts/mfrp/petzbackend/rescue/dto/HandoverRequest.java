
// ============================================================
// FILE 18: rescue/dto/HandoverRequest.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class HandoverRequest {

    @NotNull
    private UUID hospitalId;

    @NotNull
    private UUID bookingId;

    private UUID animalId; // optional: link existing animal profile
}
