
// ─────────────────────────────────────────────
// FILE 23: hospital/controller/SlotManagementController.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.hospital.dto.*;
import com.cts.mfrp.petzbackend.hospital.service.SlotManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class SlotManagementController {

    private final SlotManagementService service;

    // US-3.3.1 — Create slots (single or recurring)
    // POST /api/v1/hospitals/slots
    @PostMapping("/slots")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> createSlots(
            @Valid @RequestBody SlotCreateRequest req) {
        List<SlotResponse> slots = service.createSlots(req);
        return ResponseEntity.ok(ApiResponse.ok(
                slots.size() + " slot(s) created.", slots));
    }

    // US-3.3.1 — Get slots for a date (user calendar)
    // GET /api/v1/hospitals/{hospitalId}/slots?date=2026-04-10&doctorId=<uuid>
    @GetMapping("/{hospitalId}/slots")
    public ResponseEntity<ApiResponse<List<SlotResponse>>> getSlots(
            @PathVariable UUID hospitalId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Slots fetched.", service.getSlotsForDate(hospitalId, date, doctorId)));
    }

    // US-3.3.2 — Add blackout date
    // POST /api/v1/hospitals/blackout
    @PostMapping("/blackout")
    public ResponseEntity<ApiResponse<Void>> addBlackout(
            @Valid @RequestBody BlackoutDateRequest req) {
        service.addBlackoutDate(req);
        return ResponseEntity.ok(ApiResponse.ok(
                "Blackout date added. All slots blocked.", null));
    }

    // US-3.3.2 — Remove blackout date
    // DELETE /api/v1/hospitals/{hospitalId}/blackout?date=2026-04-10
    @DeleteMapping("/{hospitalId}/blackout")
    public ResponseEntity<ApiResponse<Void>> removeBlackout(
            @PathVariable UUID hospitalId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        service.removeBlackoutDate(hospitalId, date);
        return ResponseEntity.ok(ApiResponse.ok(
                "Blackout date removed. Slots restored.", null));
    }

    // US-3.3.2 — Get all blackout dates
    // GET /api/v1/hospitals/{hospitalId}/blackout
    @GetMapping("/{hospitalId}/blackout")
    public ResponseEntity<ApiResponse<List<LocalDate>>> getBlackouts(
            @PathVariable UUID hospitalId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Blackout dates fetched.",
                service.getBlackoutDates(hospitalId)));
    }

    // US-3.3.3 — View slot utilization
    // GET /api/v1/hospitals/{hospitalId}/utilization?from=2026-04-01&to=2026-04-30
    @GetMapping("/{hospitalId}/utilization")
    public ResponseEntity<ApiResponse<List<SlotUtilizationResponse>>> getUtilization(
            @PathVariable UUID hospitalId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID doctorId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Utilization fetched.",
                service.getUtilization(hospitalId, from, to, doctorId)));
    }
}