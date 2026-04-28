package com.cts.mfrp.petzbackend.hospital.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.hospital.dto.CancelAppointmentRequest;
import com.cts.mfrp.petzbackend.hospital.dto.CompleteAppointmentRequest;
import com.cts.mfrp.petzbackend.hospital.dto.RescheduleAppointmentRequest;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentLifecycleResponse;
import com.cts.mfrp.petzbackend.hospital.service.AppointmentLifecycleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentLifecycleController {

    private final AppointmentLifecycleService appointmentLifecycleService;

    // GET — Fetch Appointment by ID (for verification)
    @GetMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<com.cts.mfrp.petzbackend.hospital.model.Appointment>> getAppointment(
            @PathVariable UUID appointmentId) {
        return ResponseEntity.ok(ApiResponse.ok("Appointment fetched.",
                appointmentLifecycleService.getAppointment(appointmentId)));
    }

    // US-3.5.1 — Cancel Appointment (Pet Owner)
    @PatchMapping("/{appointmentId}/cancel")
    public ResponseEntity<ApiResponse<AppointmentLifecycleResponse>> cancelAppointment(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody CancelAppointmentRequest req) {
        AppointmentLifecycleResponse response =
                appointmentLifecycleService.cancelAppointment(appointmentId, req);
        return ResponseEntity.ok(ApiResponse.ok("Appointment cancelled. Status: CANCELLED.", response));
    }

    // US-3.5.2 — Reschedule Appointment (Pet Owner)
    @PatchMapping("/{appointmentId}/reschedule")
    public ResponseEntity<ApiResponse<AppointmentLifecycleResponse>> rescheduleAppointment(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody RescheduleAppointmentRequest req) {
        AppointmentLifecycleResponse response =
                appointmentLifecycleService.rescheduleAppointment(appointmentId, req);
        return ResponseEntity.ok(ApiResponse.ok("Appointment rescheduled. Status: CONFIRMED.", response));
    }

    // US-3.5.3 — Mark Appointment as Attended (Hospital/Doctor)
    @PatchMapping("/{appointmentId}/attended")
    public ResponseEntity<ApiResponse<AppointmentLifecycleResponse>> markAttended(
            @PathVariable UUID appointmentId) {
        AppointmentLifecycleResponse response =
                appointmentLifecycleService.markAttended(appointmentId);
        return ResponseEntity.ok(ApiResponse.ok("Appointment marked as attended. Status: ATTENDED.", response));
    }

    // US-3.5.4 — Complete Appointment with Clinical Notes (Doctor)
    @PatchMapping("/{appointmentId}/complete")
    public ResponseEntity<ApiResponse<AppointmentLifecycleResponse>> completeAppointment(
            @PathVariable UUID appointmentId,
            @Valid @RequestBody CompleteAppointmentRequest req) {
        AppointmentLifecycleResponse response =
                appointmentLifecycleService.completeAppointment(appointmentId, req);
        return ResponseEntity.ok(ApiResponse.ok("Appointment completed. Notes saved to pet record. Status: COMPLETED.", response));
    }

    // US-3.5.5 — Mark No-Show (Hospital/Doctor)
    @PatchMapping("/{appointmentId}/no-show")
    public ResponseEntity<ApiResponse<AppointmentLifecycleResponse>> markNoShow(
            @PathVariable UUID appointmentId) {
        AppointmentLifecycleResponse response =
                appointmentLifecycleService.markNoShow(appointmentId);
        return ResponseEntity.ok(ApiResponse.ok("Appointment marked as no-show. Status: NO_SHOW.", response));
    }
}
