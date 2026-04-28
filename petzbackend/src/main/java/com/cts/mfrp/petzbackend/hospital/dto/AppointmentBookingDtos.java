package com.cts.mfrp.petzbackend.hospital.dto;

import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

/**
 * DTOs for Epic 3.4 Appointment Booking.
 *
 *   US-3.4.1  Book an Appointment          (LockRequest → ConfirmRequest)
 *   US-3.4.2  Prevent Double-Booking       (LockResponse.expiresAt)
 *   US-3.4.3  Select Pet for Appointment   (ConfirmRequest.petId)
 *   US-3.4.4  Receive Booking Confirmation (ConfirmResponse)
 *   US-3.4.5  Emergency Booking Type       (ConfirmRequest.bookingType)
 */
public class AppointmentBookingDtos {

    private AppointmentBookingDtos() {}

    /** Step 1 of booking: lock the chosen slot for 2 minutes. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AppointmentLockRequest {
        @NotNull(message = "slotId is required")
        private UUID slotId;
        /** Caller identity — used so only the same user can confirm later. */
        @NotNull(message = "userId is required")
        private UUID userId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AppointmentLockResponse {
        private UUID slotId;
        private UUID lockedByUserId;
        private LocalDateTime lockedUntil;
        private int lockTimeoutSeconds;
        private String message;
    }

    /** Step 2 of booking: confirm and convert the lock into a booking. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AppointmentBookingRequest {
        @NotNull(message = "slotId is required")
        private UUID slotId;
        @NotNull(message = "userId is required")
        private UUID userId;
        @NotNull(message = "petId is required")
        private UUID petId;
        /** Optional service selected during the flow (free-text or HospitalService.serviceType). */
        private String serviceType;
        /** ROUTINE (default) or EMERGENCY; EMERGENCY requires an emergency-type slot. */
        private String bookingType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AppointmentBookingResponse {
        private UUID appointmentId;
        private UUID slotId;
        private UUID userId;
        private UUID petId;
        private UUID hospitalId;
        private UUID doctorId;
        private String serviceType;
        private String bookingType;
        private LocalDate appointmentDate;
        private LocalTime appointmentTime;
        private LocalTime endTime;
        private AppointmentStatus status;
        private LocalDateTime confirmedAt;
        private String message;
    }
}
