package com.cts.mfrp.petzbackend.hospital.dto;

import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentHistoryResponse {

    private UUID appointmentId;
    private UUID petId;
    private UUID hospitalId;
    private String hospitalName;
    private String hospitalCity;
    private UUID doctorId;
    private String serviceType;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private AppointmentStatus status;
    private String clinicalNotes;
}
