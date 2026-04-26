
// ─────────────────────────────────────────────
// FILE 16: hospital/dto/SlotCreateRequest.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class SlotCreateRequest {

    @NotNull private UUID      hospitalId;
    private UUID               doctorId;
    private UUID               serviceId;
    @NotNull private LocalDate slotDate;
    @NotNull private LocalTime startTime;
    @NotNull private Integer   durationMinutes;
    private String             bookingType;
    private Boolean            recurring;
    private LocalDate          recurringEnd;
    private String             recurringDays;
}
