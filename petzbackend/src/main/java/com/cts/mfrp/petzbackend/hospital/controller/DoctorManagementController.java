package com.cts.mfrp.petzbackend.hospital.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorManagementDtos.DoctorCreateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorManagementDtos.DoctorServicesLinkRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorManagementDtos.DoctorUpdateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorResponse;
import com.cts.mfrp.petzbackend.hospital.service.DoctorManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * US-3.2.3 — "Manage Doctor Profiles".
 *
 *   GET    /api/v1/hospitals/{hospitalId}/doctors[?activeOnly=true]
 *   POST   /api/v1/hospitals/{hospitalId}/doctors
 *   PUT    /api/v1/hospitals/{hospitalId}/doctors/{doctorId}
 *   DELETE /api/v1/hospitals/{hospitalId}/doctors/{doctorId}       (soft delete)
 *   PUT    /api/v1/hospitals/{hospitalId}/doctors/{doctorId}/services   (AC#3)
 */
@RestController
@RequestMapping("/api/v1/hospitals/{hospitalId}/doctors")
@RequiredArgsConstructor
public class DoctorManagementController {

    private final DoctorManagementService doctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> list(
            @PathVariable UUID hospitalId,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Doctors fetched.", doctorService.listDoctors(hospitalId, activeOnly)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DoctorResponse>> add(
            @PathVariable UUID hospitalId,
            @Valid @RequestBody DoctorCreateRequest body) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Doctor added.", doctorService.addDoctor(hospitalId, body)));
    }

    @PutMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<DoctorResponse>> update(
            @PathVariable UUID hospitalId,
            @PathVariable UUID doctorId,
            @Valid @RequestBody DoctorUpdateRequest body) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Doctor updated.",
                doctorService.updateDoctor(hospitalId, doctorId, body)));
    }

    /** US-3.2.3 AC#1 "remove" → soft delete (isActive=false). */
    @DeleteMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable UUID hospitalId,
            @PathVariable UUID doctorId) {
        doctorService.softDeleteDoctor(hospitalId, doctorId);
        return ResponseEntity.ok(ApiResponse.ok("Doctor deactivated.", null));
    }

    /** US-3.2.3 AC#3 — replace the doctor's linked services set. */
    @PutMapping("/{doctorId}/services")
    public ResponseEntity<ApiResponse<DoctorResponse>> linkServices(
            @PathVariable UUID hospitalId,
            @PathVariable UUID doctorId,
            @Valid @RequestBody DoctorServicesLinkRequest body) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Doctor services updated.",
                doctorService.linkServices(hospitalId, doctorId, body)));
    }
}
