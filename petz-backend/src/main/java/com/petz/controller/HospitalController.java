package com.petz.controller;

import com.petz.entity.Doctor;
import com.petz.entity.Hospital;
import com.petz.dto.request.DoctorRequest;
import com.petz.dto.response.SlotResponse;
import com.petz.service.AppointmentService;
import com.petz.service.DoctorService;
import com.petz.service.HospitalService;
import com.petz.util.ApiResponse;
import com.petz.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;
    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final SecurityUtil securityUtil;

    // ── Public ────────────────────────────────────────────────────────

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<Hospital>>> getAll(
            @RequestParam(required = false) String city) {
        List<Hospital> list = city != null
                ? hospitalService.getByCity(city)
                : hospitalService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<ApiResponse<Hospital>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(hospitalService.getById(id)));
    }

    @GetMapping("/public/{hospitalId}/doctors")
    public ResponseEntity<ApiResponse<List<Doctor>>> getDoctors(@PathVariable Long hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.getByHospital(hospitalId)));
    }

    @GetMapping("/public/{hospitalId}/doctors/{doctorId}/slots")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlots(
            @PathVariable Long hospitalId,
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(appointmentService.getAvailableSlots(doctorId, date)));
    }

    // ── Hospital Admin ────────────────────────────────────────────────

    @GetMapping("/profile")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<ApiResponse<Hospital>> getMyProfile() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(hospitalService.getByOwner(userId)));
    }

    @PostMapping("/profile")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<ApiResponse<Hospital>> saveProfile(@RequestBody Map<String, Object> body) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(hospitalService.createOrUpdate(userId, body), "Hospital profile saved."));
    }

    @PostMapping("/profile/logo")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<ApiResponse<Hospital>> uploadLogo(@RequestParam("file") MultipartFile file)
            throws IOException {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(hospitalService.uploadLogo(userId, file), "Logo uploaded."));
    }

    @PostMapping("/profile/doctors")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<ApiResponse<Doctor>> addDoctor(@RequestBody DoctorRequest req) {
        Long userId = securityUtil.getCurrentUserId();
        Hospital h = hospitalService.getByOwner(userId);
        return ResponseEntity.ok(ApiResponse.ok(doctorService.addDoctor(h.getId(), req), "Doctor added."));
    }

    @PutMapping("/profile/doctors/{doctorId}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<ApiResponse<Doctor>> updateDoctor(
            @PathVariable Long doctorId,
            @RequestBody DoctorRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(doctorService.updateDoctor(doctorId, req), "Doctor updated."));
    }

    @DeleteMapping("/profile/doctors/{doctorId}")
    @PreAuthorize("hasRole('HOSPITAL')")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long doctorId) {
        doctorService.delete(doctorId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Doctor removed."));
    }
}
