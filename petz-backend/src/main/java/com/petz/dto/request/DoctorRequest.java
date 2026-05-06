package com.petz.dto.request;

import lombok.Data;

import java.time.LocalTime;

@Data
public class DoctorRequest {
    private String name;
    private String specialization;
    private String phone;
    private String email;
    private LocalTime scheduleStart;
    private LocalTime scheduleEnd;
    private Integer slotDuration;
}
