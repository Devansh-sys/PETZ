package com.cts.mfrp.petzbackend.hospital.dto;

import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Shared response DTO for all Epic 3.5 lifecycle operations.
 * Returned by cancel, reschedule, attended, complete, and no-show endpoints.
 */
public class AppointmentLifecycleResponse {

    private UUID appointmentId;
    private AppointmentStatus newStatus;
    private String message;
    private LocalDateTime updatedAt;

    public AppointmentLifecycleResponse() {}

    public AppointmentLifecycleResponse(UUID appointmentId, AppointmentStatus newStatus,
                                        String message, LocalDateTime updatedAt) {
        this.appointmentId = appointmentId;
        this.newStatus = newStatus;
        this.message = message;
        this.updatedAt = updatedAt;
    }

    public UUID getAppointmentId() { return appointmentId; }
    public void setAppointmentId(UUID appointmentId) { this.appointmentId = appointmentId; }

    public AppointmentStatus getNewStatus() { return newStatus; }
    public void setNewStatus(AppointmentStatus newStatus) { this.newStatus = newStatus; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
