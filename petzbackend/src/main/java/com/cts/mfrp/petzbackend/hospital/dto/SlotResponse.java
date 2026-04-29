package com.cts.mfrp.petzbackend.hospital.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data @Builder
public class SlotResponse {
    private UUID      id;
    private UUID      hospitalId;
    private UUID      doctorId;
    private String    doctorName;
    private UUID      serviceId;
    private String    serviceName;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private int       durationMinutes;
    private String    slotStatus;
    private String    bookingType;
    private boolean   available;
}
