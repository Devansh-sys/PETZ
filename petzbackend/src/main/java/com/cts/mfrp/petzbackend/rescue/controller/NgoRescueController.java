package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.rescue.dto.NgoAssignmentResponse;
import com.cts.mfrp.petzbackend.rescue.service.NgoRescueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * NGO rescue endpoints:
 * GET  /api/v1/ngo/rescue-assignments             — my assigned rescues
 * POST /api/v1/ngo/rescue-assignments/{id}/accept
 * POST /api/v1/ngo/rescue-assignments/{id}/reject
 * GET  /api/v1/ngo/open-reports                   — all REPORTED (unassigned) rescues
 * POST /api/v1/ngo/open-reports/{sosReportId}/claim — NGO self-assigns and accepts
 */
@RestController
@RequiredArgsConstructor
public class NgoRescueController {

    private final NgoRescueService ngoRescueService;

    // ── My Assignments ────────────────────────────────────────────────────────

    @GetMapping("/api/v1/ngo/rescue-assignments")
    public ResponseEntity<ApiResponse<List<NgoAssignmentResponse>>> list(
            @AuthenticationPrincipal UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {

        UUID actorId = userId != null ? userId : headerUserId;
        return ResponseEntity.ok(ApiResponse.ok(
                "Rescue assignments fetched.",
                ngoRescueService.getAssignmentsForUser(actorId)));
    }

    @PostMapping("/api/v1/ngo/rescue-assignments/{assignmentId}/accept")
    public ResponseEntity<ApiResponse<NgoAssignmentResponse>> accept(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {

        UUID actorId = userId != null ? userId : headerUserId;
        return ResponseEntity.ok(ApiResponse.ok(
                "Rescue accepted.",
                ngoRescueService.accept(assignmentId, actorId)));
    }

    @PostMapping("/api/v1/ngo/rescue-assignments/{assignmentId}/reject")
    public ResponseEntity<ApiResponse<NgoAssignmentResponse>> reject(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {

        UUID actorId = userId != null ? userId : headerUserId;
        return ResponseEntity.ok(ApiResponse.ok(
                "Rescue rejected.",
                ngoRescueService.reject(assignmentId, actorId)));
    }

    // ── Open Reports (any NGO can see and claim) ──────────────────────────────

    @GetMapping("/api/v1/ngo/open-reports")
    public ResponseEntity<ApiResponse<List<NgoAssignmentResponse>>> openReports() {
        return ResponseEntity.ok(ApiResponse.ok(
                "Open rescue reports fetched.",
                ngoRescueService.getOpenReports()));
    }

    @PostMapping("/api/v1/ngo/open-reports/{sosReportId}/claim")
    public ResponseEntity<ApiResponse<NgoAssignmentResponse>> claim(
            @PathVariable UUID sosReportId,
            @AuthenticationPrincipal UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {

        UUID actorId = userId != null ? userId : headerUserId;
        return ResponseEntity.ok(ApiResponse.ok(
                "Rescue claimed.",
                ngoRescueService.claimReport(sosReportId, actorId)));
    }
}
