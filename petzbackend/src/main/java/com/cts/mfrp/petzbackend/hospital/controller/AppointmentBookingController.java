package com.cts.mfrp.petzbackend.hospital.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentBookingDtos.AppointmentBookingRequest;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentBookingDtos.AppointmentBookingResponse;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentBookingDtos.AppointmentLockRequest;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentBookingDtos.AppointmentLockResponse;
import com.cts.mfrp.petzbackend.hospital.service.AppointmentBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Epic 3.4 — Appointment Booking endpoints.
 *
 *   POST   /api/v1/appointments/lock          → US-3.4.1 + US-3.4.2
 *   POST   /api/v1/appointments/confirm       → US-3.4.1 + US-3.4.3 + US-3.4.4 + US-3.4.5
 *   DELETE /api/v1/appointments/lock/{slotId} → explicit release
 */
@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
public class AppointmentBookingController {

    private final AppointmentBookingService bookingService;

    /** Phase 1: lock the chosen slot for 2 min during checkout (US-3.4.2). */
    @PostMapping("/lock")
    public ResponseEntity<ApiResponse<AppointmentLockResponse>> lockSlot(
            @Valid @RequestBody AppointmentLockRequest request) {
        AppointmentLockResponse response = bookingService.lockSlot(request);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    /** Phase 2: confirm and persist the booking (US-3.4.1, 3.4.3, 3.4.4, 3.4.5). */
    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<AppointmentBookingResponse>> confirmBooking(
            @Valid @RequestBody AppointmentBookingRequest request) {
        AppointmentBookingResponse response = bookingService.confirmBooking(request);
        return ResponseEntity.ok(ApiResponse.ok(response.getMessage(), response));
    }

    /** User explicitly cancels the checkout; slot goes back to AVAILABLE. */
    @DeleteMapping("/lock/{slotId}")
    public ResponseEntity<ApiResponse<Void>> releaseLock(
            @PathVariable UUID slotId,
            @RequestParam UUID userId) {
        bookingService.releaseLock(slotId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Lock released.", null));
    }
}
