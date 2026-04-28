package com.cts.mfrp.petzbackend.hospital.dto;

import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDate;
<<<<<<< Updated upstream
=======
import java.time.LocalDateTime;
>>>>>>> Stashed changes
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentHistoryResponse {

    private UUID appointmentId;
<<<<<<< Updated upstream
    private UUID petId;
    private UUID hospitalId;
    private String hospitalName;
    private String hospitalCity;
    private UUID doctorId;
    private String serviceType;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private AppointmentStatus status;
=======
    // frontend expects "id"
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
>>>>>>> Stashed changes
    private String clinicalNotes;
}
