package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.common.exception.AuthExceptions;
import com.cts.mfrp.petzbackend.rescue.dto.NgoAssignmentResponse;
import com.cts.mfrp.petzbackend.rescue.service.NgoRescueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Rescue endpoints used by NGO representatives.
 *
 * GET  /api/v1/ngo/open-reports                        — all REPORTED (unassigned) rescues
 * POST /api/v1/ngo/open-reports/{sosReportId}/claim    — NGO self-accepts an open rescue
 * GET  /api/v1/ngo/rescue-assignments                  — admin-assigned rescues for this NGO
 * POST /api/v1/ngo/rescue-assignments/{id}/accept      — accept a PENDING assignment
 * POST /api/v1/ngo/rescue-assignments/{id}/reject      — reject a PENDING assignment
 */
@RestController
@RequiredArgsConstructor
public class NgoRescueController {

    private final NgoRescueService ngoRescueService;

    // ── Open Reports (visible to all NGOs) ────────────────────────────────────

    @GetMapping("/api/v1/ngo/open-reports")
    public ResponseEntity<ApiResponse<List<NgoAssignmentResponse>>> openReports() {
        return ResponseEntity.ok(ApiResponse.ok(
                "Open rescue reports fetched.",
                ngoRescueService.getOpenReports()));
    }

    @PostMapping("/api/v1/ngo/open-reports/{sosReportId}/claim")
    public ResponseEntity<ApiResponse<NgoAssignmentResponse>> claim(
            @PathVariable UUID sosReportId,
            @AuthenticationPrincipal UUID principalId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerId) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Rescue claimed.",
                ngoRescueService.claimReport(sosReportId, resolve(principalId, headerId))));
    }

    // ── My Assignments (admin-assigned to this NGO) ───────────────────────────

    @GetMapping("/api/v1/ngo/rescue-assignments")
    public ResponseEntity<ApiResponse<List<NgoAssignmentResponse>>> list(
            @AuthenticationPrincipal UUID principalId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerId) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Rescue assignments fetched.",
                ngoRescueService.getAssignmentsForUser(resolve(principalId, headerId))));
    }

    @PostMapping("/api/v1/ngo/rescue-assignments/{assignmentId}/accept")
    public ResponseEntity<ApiResponse<NgoAssignmentResponse>> accept(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal UUID principalId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerId) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Rescue accepted.",
                ngoRescueService.accept(assignmentId, resolve(principalId, headerId))));
    }

    @PostMapping("/api/v1/ngo/rescue-assignments/{assignmentId}/reject")
    public ResponseEntity<ApiResponse<NgoAssignmentResponse>> reject(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal UUID principalId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerId) {

        return ResponseEntity.ok(ApiResponse.ok(
                "Rescue rejected.",
                ngoRescueService.reject(assignmentId, resolve(principalId, headerId))));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private UUID resolve(UUID principal, UUID header) {
        if (principal != null) return principal;
        if (header    != null) return header;
        throw new AuthExceptions.UnauthenticatedException();
    }
}
