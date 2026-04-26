package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request body for US-3.5.2 — Reschedule Appointment.
 * The old slot is released and the new slot is locked atomically.
 */
public class RescheduleAppointmentRequest {

    @NotNull(message = "New slot ID is required")
    private UUID newSlotId;

    public RescheduleAppointmentRequest() {}

    public RescheduleAppointmentRequest(UUID newSlotId) {
        this.newSlotId = newSlotId;
    }

    public UUID getNewSlotId() { return newSlotId; }
    public void setNewSlotId(UUID newSlotId) { this.newSlotId = newSlotId; }
}
