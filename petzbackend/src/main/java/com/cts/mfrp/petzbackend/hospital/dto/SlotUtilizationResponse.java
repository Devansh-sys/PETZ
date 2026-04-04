
// ─────────────────────────────────────────────
// FILE 19: hospital/dto/SlotUtilizationResponse.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data @Builder
public class SlotUtilizationResponse {
    private LocalDate date;
    private long      totalSlots;
    private long      bookedSlots;
    private long      availableSlots;
    private double    utilizationPercent;
    private String    doctorName;
}