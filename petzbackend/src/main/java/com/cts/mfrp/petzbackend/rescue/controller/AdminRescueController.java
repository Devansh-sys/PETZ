package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;
import com.cts.mfrp.petzbackend.rescue.dto.AdminRescueMapResponse;
import com.cts.mfrp.petzbackend.rescue.dto.ReassignRequest;
import com.cts.mfrp.petzbackend.rescue.dto.ReassignResponse;
import com.cts.mfrp.petzbackend.rescue.service.AdminRescueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Admin-only rescue management endpoints.
 * All routes require ADMIN role (enforced via @PreAuthorize).
 */
@RestController
@RequestMapping("/admin/rescues")
@RequiredArgsConstructor

public class AdminRescueController {

    private final AdminRescueService adminRescueService;

    /**
     * GET /admin/rescues/live
     *
     * Returns all non-completed SOS reports for the global map dashboard.
     *
     * Query params (all optional):
     *   status   – e.g. REPORTED | DISPATCHED | ON_SITE | TRANSPORTING
     *   severity – e.g. CRITICAL | MODERATE | LOW
     *   ngoId    – UUID of the NGO to filter by
     *
     * Response: List<AdminRescueMapResponse>
     */
    @GetMapping("/live")
    public ResponseEntity<List<AdminRescueMapResponse>> getLiveRescues(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) UrgencyLevel severity,
            @RequestParam(required = false) UUID ngoId) {

        return ResponseEntity.ok(
                adminRescueService.getAllActiveRescues(status, severity, ngoId));
    }

    /**
     * PATCH /admin/rescues/{sosReportId}/reassign
     *
     * Reassigns a stalled rescue to a different NGO representative.
     * Archives the current assignment and creates a new PENDING one.
     *
     * Request body: { "newNgoId": "...", "newVolunteerId": "...", "reason": "..." }
     * Response:     ReassignResponse (assignmentId, sosReportId, newNgoId, newVolunteerId,
     *                                 reason, reassignedAt)
     */
    @PatchMapping("/{sosReportId}/reassign")
    public ResponseEntity<ReassignResponse> reassignRescue(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody ReassignRequest req,
            @AuthenticationPrincipal UUID adminId) {

        return ResponseEntity.ok(
                adminRescueService.reassignRescue(sosReportId, req, adminId));
    }
}
