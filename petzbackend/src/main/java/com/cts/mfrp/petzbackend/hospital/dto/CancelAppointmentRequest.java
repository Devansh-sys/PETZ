package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for US-3.5.1 — Cancel Appointment.
 * Cancellation is only allowed within the hospital-defined policy window.
 */
public class CancelAppointmentRequest {

    @NotBlank(message = "Cancellation reason is required")
    private String reason;

    public CancelAppointmentRequest() {}

    public CancelAppointmentRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
