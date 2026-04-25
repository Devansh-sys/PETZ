package com.cts.mfrp.petzbackend.hospital.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentHistoryResponse;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalDashboardResponse;
import com.cts.mfrp.petzbackend.hospital.service.AppointmentHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AppointmentHistoryController {

    private final AppointmentHistoryService historyService;

    // US-3.6.1 — GET /api/v1/users/{userId}/appointments
    @GetMapping("/api/v1/users/{userId}/appointments")
    public ResponseEntity<ApiResponse<List<AppointmentHistoryResponse>>> getUserAppointmentHistory(
            @PathVariable UUID userId,
            @RequestParam(required = false) UUID petId,
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        List<AppointmentHistoryResponse> history = historyService.getUserHistory(userId, petId, hospitalId, from, to);
        return ResponseEntity.ok(ApiResponse.ok("Appointment history fetched", history));
    }

    // US-3.6.2 — GET /api/v1/hospitals/{hospitalId}/dashboard
    @GetMapping("/api/v1/hospitals/{hospitalId}/dashboard")
    public ResponseEntity<ApiResponse<HospitalDashboardResponse>> getHospitalDashboard(
            @PathVariable UUID hospitalId,
            @RequestParam(required = false) UUID doctorId) {

        HospitalDashboardResponse dashboard = historyService.getHospitalDashboard(hospitalId, doctorId);
        return ResponseEntity.ok(ApiResponse.ok("Dashboard fetched", dashboard));
    }
}
