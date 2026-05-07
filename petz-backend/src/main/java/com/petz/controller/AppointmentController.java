package com.petz.controller;

import com.petz.dto.request.AppointmentRequest;
import com.petz.dto.response.AppointmentResponse;
import com.petz.dto.response.SlotResponse;
import com.petz.entity.Appointment;
import com.petz.service.AppointmentService;
import com.petz.service.HospitalService;
import com.petz.util.ApiResponse;
import com.petz.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final HospitalService hospitalService;
    private final SecurityUtil securityUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<Appointment>> book(@Valid @RequestBody AppointmentRequest req) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.book(userId, req), "Appointment booked."));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> myAppointments() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getByUser(userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Appointment>> cancel(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.cancel(id, userId), "Appointment cancelled."));
    }

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAvailableSlots(doctorId, date)));
    }

    // Hospital admin endpoints
    @GetMapping("/hospital")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> hospitalAppointments() {
        Long userId = securityUtil.getCurrentUserId();
        Long hospitalId = hospitalService.getByOwner(userId).getId();
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getByHospital(hospitalId)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('HOSPITAL') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Appointment>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(
                appointmentService.updateStatus(id, body.get("status"), userId), "Status updated."));
    }
}
