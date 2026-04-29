package com.cts.mfrp.petzbackend.hospital.dto;

import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentHistoryResponse {

    private UUID appointmentId;
    private String id;
    private UUID petId;
    private String petName;
    private String petSpecies;
    private UUID hospitalId;
    private String hospitalName;
    private String hospitalAddress;
    private String hospitalPhone;
    private String hospitalCity;
    private UUID doctorId;
    private String doctorName;
    private String serviceName;
    private String serviceType;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String appointmentType;
    private AppointmentStatus status;
    private LocalDateTime bookedAt;
    private String clinicalNotes;
}
