package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body for US-3.5.4 — Complete Appointment with Notes.
 * Clinical notes are linked to the pet's medical record.
 */
public class CompleteAppointmentRequest {

    @NotBlank(message = "Clinical notes are required to complete an appointment")
    private String clinicalNotes;

    public CompleteAppointmentRequest() {}

    public CompleteAppointmentRequest(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getClinicalNotes() { return clinicalNotes; }
    public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
}
