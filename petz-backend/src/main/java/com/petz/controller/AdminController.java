package com.petz.controller;

import com.petz.dto.response.UserResponse;
import com.petz.entity.Hospital;
import com.petz.entity.Ngo;
import com.petz.entity.RescueReport;
import com.petz.entity.AdoptionApplication;
import com.petz.service.*;
import com.petz.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final NgoService ngoService;
    private final HospitalService hospitalService;
    private final RescueService rescueService;
    private final AdoptionService adoptionService;

    // ── Users ─────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUser(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.toggleActive(id, body.getOrDefault("active", true)), "User status updated."));
    }

    // ── NGOs ──────────────────────────────────────────────────────────

    @GetMapping("/ngos")
    public ResponseEntity<ApiResponse<List<Ngo>>> listNgos() {
        return ResponseEntity.ok(ApiResponse.ok(ngoService.getAll()));
    }

    @GetMapping("/ngos/unverified")
    public ResponseEntity<ApiResponse<List<Ngo>>> unverifiedNgos() {
        return ResponseEntity.ok(ApiResponse.ok(ngoService.getUnverified()));
    }

    @PatchMapping("/ngos/{id}/verify")
    public ResponseEntity<ApiResponse<Ngo>> verifyNgo(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                ngoService.verify(id, body.getOrDefault("verified", true)), "NGO verification updated."));
    }

    @PatchMapping("/ngos/{id}/toggle")
    public ResponseEntity<ApiResponse<Ngo>> toggleNgo(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                ngoService.toggleActive(id, body.getOrDefault("active", true)), "NGO status updated."));
    }

    // ── Hospitals ─────────────────────────────────────────────────────

    @GetMapping("/hospitals")
    public ResponseEntity<ApiResponse<List<Hospital>>> listHospitals() {
        return ResponseEntity.ok(ApiResponse.ok(hospitalService.getAll()));
    }

    @PatchMapping("/hospitals/{id}/toggle")
    public ResponseEntity<ApiResponse<Hospital>> toggleHospital(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                hospitalService.toggleActive(id, body.getOrDefault("active", true)), "Hospital status updated."));
    }

    // ── Rescues ───────────────────────────────────────────────────────

    @GetMapping("/rescues")
    public ResponseEntity<ApiResponse<List<RescueReport>>> listRescues(
            @RequestParam(required = false) String status) {
        List<RescueReport> list = status != null
                ? rescueService.getByStatus(status)
                : rescueService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    // ── Adoptions ─────────────────────────────────────────────────────

    @GetMapping("/adoptions")
    public ResponseEntity<ApiResponse<List<AdoptionApplication>>> listAdoptions() {
        return ResponseEntity.ok(ApiResponse.ok(adoptionService.getAllApplications()));
    }
}
