package com.cts.mfrp.petzbackend.hospital.dto;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentMetricsResponse {

    private UUID hospitalId;
    private String hospitalName;
    private String city;
    private long totalAppointments;
    private long confirmedCount;
    private long attendedCount;
    private long completedCount;
    private long cancelledCount;
    private long noShowCount;
    private double completionRate;
    private double cancellationRate;
    private double noShowRate;
}
