package com.cts.mfrp.petzbackend.hospital.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentMetricsResponse;
import com.cts.mfrp.petzbackend.hospital.dto.CreateHospitalRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DisableHospitalRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorManagementDtos.DoctorCreateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorResponse;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalResponse;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalVerificationRequest;
import com.cts.mfrp.petzbackend.hospital.service.HospitalAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/hospitals")
@RequiredArgsConstructor
public class HospitalAdminController {

    private final HospitalAdminService adminService;

    // US-3.7.1 — GET /admin/hospitals/pending
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<HospitalResponse>>> getPendingRegistrations() {
        return ResponseEntity.ok(ApiResponse.ok("Pending registrations fetched", adminService.getPendingRegistrations()));
    }

    // US-3.7.1 — POST /admin/hospitals/{hospitalId}/verify
    @PostMapping("/{hospitalId}/verify")
    public ResponseEntity<ApiResponse<HospitalResponse>> verifyHospital(
            @PathVariable UUID hospitalId,
            @Valid @RequestBody HospitalVerificationRequest req,
            @AuthenticationPrincipal UUID adminId) {

        HospitalResponse updated = adminService.verifyHospital(hospitalId, adminId, req);
        return ResponseEntity.ok(ApiResponse.ok("Hospital " + req.getAction().name().toLowerCase(), updated));
    }

    // US-3.7.2 — GET /admin/hospitals/metrics
    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<List<AppointmentMetricsResponse>>> getMetrics(
            @RequestParam(required = false) UUID hospitalId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        return ResponseEntity.ok(ApiResponse.ok("Metrics fetched", adminService.getMetrics(hospitalId, city, from, to)));
    }

    // US-3.7.3 — POST /admin/hospitals/{hospitalId}/disable
    @PostMapping("/{hospitalId}/disable")
    public ResponseEntity<ApiResponse<Void>> disableHospital(
            @PathVariable UUID hospitalId,
            @Valid @RequestBody DisableHospitalRequest req,
            @AuthenticationPrincipal UUID adminId) {

        adminService.disableHospital(hospitalId, adminId, req);
        return ResponseEntity.ok(ApiResponse.ok("Hospital disabled. Active appointments cancelled."));
    }

    // POST /admin/hospitals/{hospitalId}/enable — re-activate a disabled hospital
    @PostMapping("/{hospitalId}/enable")
    public ResponseEntity<ApiResponse<HospitalResponse>> enableHospital(
            @PathVariable UUID hospitalId,
            @AuthenticationPrincipal UUID adminId) {
        return ResponseEntity.ok(ApiResponse.ok("Hospital enabled.", adminService.enableHospital(hospitalId, adminId)));
    }

    // POST /admin/hospitals — admin creates a hospital manually (pre-verified)
    @PostMapping
    public ResponseEntity<ApiResponse<HospitalResponse>> createHospital(
            @Valid @RequestBody CreateHospitalRequest req,
            @AuthenticationPrincipal UUID adminId) {
        return ResponseEntity.ok(ApiResponse.ok("Hospital created.", adminService.createHospital(adminId, req)));
    }

    // POST /admin/hospitals/{hospitalId}/doctors — admin adds a doctor
    @PostMapping("/{hospitalId}/doctors")
    public ResponseEntity<ApiResponse<DoctorResponse>> addDoctor(
            @PathVariable UUID hospitalId,
            @Valid @RequestBody DoctorCreateRequest req,
            @AuthenticationPrincipal UUID adminId) {
        return ResponseEntity.ok(ApiResponse.ok("Doctor added.", adminService.addDoctor(hospitalId, adminId, req)));
    }
}
