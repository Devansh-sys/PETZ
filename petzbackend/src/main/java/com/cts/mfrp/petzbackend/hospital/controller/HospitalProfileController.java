package com.cts.mfrp.petzbackend.hospital.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.hospital.dto.EmergencyStatusRequest;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalRegistrationRequest;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalResponse;
import com.cts.mfrp.petzbackend.hospital.dto.OperatingHoursDto;
import com.cts.mfrp.petzbackend.hospital.service.HospitalProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Epic 3.2 — Hospital Profile Management (admin-facing endpoints).
 *
 *   POST  /api/v1/hospitals/register                      US-3.2.1
 *   PATCH /api/v1/hospitals/{id}/operating-hours          US-3.2.4 AC#1
 *   PATCH /api/v1/hospitals/{id}/emergency-status         US-3.2.4 AC#2/AC#3
 *
 * Service CRUD and doctor CRUD live in sibling controllers
 * ({@code ServiceCatalogController}, {@code DoctorManagementController})
 * so each user story has its own focused endpoint surface.
 */
@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
@Validated
public class HospitalProfileController {

    private final HospitalProfileService profileService;

    // US-3.2.1 — Register Hospital on Platform
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<HospitalResponse>> register(
            @Valid @RequestBody HospitalRegistrationRequest request) {
        HospitalResponse created = profileService.registerHospital(request);
        return ResponseEntity.ok(
                ApiResponse.ok("Hospital submitted for verification. Status: PENDING.", created));
    }

    // US-3.2.4 AC#1 — Hours editable per day
    @PatchMapping("/{hospitalId}/operating-hours")
    public ResponseEntity<ApiResponse<HospitalResponse>> updateHours(
            @PathVariable UUID hospitalId,
            @Valid @RequestBody OperatingHoursDto body) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Operating hours updated.",
                profileService.updateOperatingHours(hospitalId, body)));
    }

    // US-3.2.4 AC#2/AC#3 — Emergency toggle (reflected in directory + rescue)
    @PatchMapping("/{hospitalId}/emergency-status")
    public ResponseEntity<ApiResponse<HospitalResponse>> updateEmergencyStatus(
            @PathVariable UUID hospitalId,
            @Valid @RequestBody EmergencyStatusRequest body) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Emergency status updated.",
                profileService.updateEmergencyStatus(hospitalId, body.getEmergencyReady())));
    }
}
