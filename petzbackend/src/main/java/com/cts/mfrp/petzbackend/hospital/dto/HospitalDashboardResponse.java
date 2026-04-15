package com.cts.mfrp.petzbackend.hospital.dto;

import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalDashboardResponse {

    private List<AppointmentSlot> todayAppointments;
    private List<AppointmentSlot> upcomingAppointments;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AppointmentSlot {
        private UUID appointmentId;
        private UUID petId;
        private UUID doctorId;
        private String serviceType;
        private LocalDate appointmentDate;
        private LocalTime appointmentTime;
        private AppointmentStatus status;
    }
}
