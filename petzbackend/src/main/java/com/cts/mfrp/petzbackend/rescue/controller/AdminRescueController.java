package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;
import com.cts.mfrp.petzbackend.rescue.dto.AdminRescueMapResponse;
import com.cts.mfrp.petzbackend.rescue.service.AdminRescueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin rescue monitoring endpoints.
 * NGO assignment is now fully automatic via RescueQueueService —
 * admin has a read-only view of all active rescues and which NGO is handling each.
 */
@RestController
@RequestMapping("/api/v1/admin/rescues")
@RequiredArgsConstructor
public class AdminRescueController {

    private final AdminRescueService adminRescueService;

    /**
     * GET /admin/rescues/live
     *
     * Returns all non-completed SOS reports for the admin dashboard.
     * Each entry includes the NGO currently handling it (PENDING or ACCEPTED).
     *
     * Query params (all optional):
     *   status   – REPORTED | ASSIGNED | DISPATCHED | REJECTED | ...
     *   severity – CRITICAL | MODERATE | LOW
     *   ngoId    – UUID to filter by a specific NGO
     */
    @GetMapping("/live")
    public ResponseEntity<List<AdminRescueMapResponse>> getLiveRescues(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) UrgencyLevel severity,
            @RequestParam(required = false) UUID ngoId) {

        return ResponseEntity.ok(
                adminRescueService.getAllActiveRescues(status, severity, ngoId));
    }
}
