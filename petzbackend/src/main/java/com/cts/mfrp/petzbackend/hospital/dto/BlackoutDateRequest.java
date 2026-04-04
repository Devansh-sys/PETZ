
// ─────────────────────────────────────────────
// FILE 18: hospital/dto/BlackoutDateRequest.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class BlackoutDateRequest {
    @NotNull private UUID      hospitalId;
    @NotNull private LocalDate blackoutDate;
    private String             reason;
}