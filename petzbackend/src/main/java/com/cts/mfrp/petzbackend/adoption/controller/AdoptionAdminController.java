package com.cts.mfrp.petzbackend.adoption.controller;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.AuditLogResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.MetricsResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.NgoResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.VerifyNgoRequest;
import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.service.AdoptionAdminService;
import com.cts.mfrp.petzbackend.adoption.service.AdoptionAuditService;
import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Epic 2.6 — admin oversight.
 *
 *   GET  /admin/adoptions/metrics              US-2.6.1
 *   GET  /admin/adoptions/ngos[?verified=...]  US-2.6.2 list
 *   POST /admin/adoptions/ngos/{id}/verify     US-2.6.2 action
 *
 * (Dispute endpoints live in {@code AdoptionDisputeController}.)
 */
/**
 * US-4.1.3 — admin-only access. When a JWT is present the role must be ADMIN;
 * when no JWT is present we fall back to the dev-mode X-User-Id header so
 * existing tests and internal tooling keep working.
 */
@RestController
@RequestMapping("/admin/adoptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or !isAuthenticated()")
public class AdoptionAdminController {

    private final AdoptionAdminService adminService;
    private final AdoptionAuditService auditService;

    // US-2.6.1 — KPI dashboard
    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<MetricsResponse>> metrics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID ngoId,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Adoption metrics fetched.",
                adminService.computeMetrics(from, to, ngoId, city)));
    }

    // US-2.6.2 — list NGOs (filter by verified)
    @GetMapping("/ngos")
    public ResponseEntity<ApiResponse<List<NgoResponse>>> listNgos(
            @RequestParam(required = false) Boolean verified) {
        return ResponseEntity.ok(ApiResponse.ok(
                "NGOs fetched.", adminService.listNgos(verified)));
    }

    // US-2.6.2 — verify/reject/suspend an NGO
    @PostMapping("/ngos/{ngoId}/verify")
    public ResponseEntity<ApiResponse<NgoResponse>> verifyNgo(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID ngoId,
            @Valid @RequestBody VerifyNgoRequest body) {
        UUID adminId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "NGO " + body.getAction().toLowerCase() + " recorded.",
                adminService.verifyNgo(adminId, ngoId, body)));
    }

    // US-4.3 — unified audit log (paginated, filterable)
    /**
     * GET /admin/adoptions/audit-logs
     *
     * Query params (all optional):
     *   targetType  — PET_LISTING | APPLICATION | ADOPTION | NGO | DISPUTE
     *   targetId    — UUID of the specific entity
     *   actorId     — UUID of the user who made the change
     *   from        — ISO date (inclusive start)
     *   to          — ISO date (inclusive end)
     *   page, size  — pagination (default 0 / 50)
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> auditLogs(
            @RequestParam(required = false) AuditTargetType targetType,
            @RequestParam(required = false) UUID            targetId,
            @RequestParam(required = false) UUID            actorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay()          : null;
        LocalDateTime toDt   = to   != null ? to.atTime(LocalTime.MAX)     : null;
        return ResponseEntity.ok(ApiResponse.ok(
                "Audit logs fetched.",
                auditService.listFiltered(targetType, targetId, actorId, fromDt, toDt, page, size)));
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private UUID resolveActor(UUID principalUserId, UUID headerUserId) {
        if (principalUserId != null) return principalUserId;
        if (headerUserId    != null) return headerUserId;
        throw new IllegalArgumentException(
                "Missing admin identity — authenticate or send X-User-Id header in dev.");
    }
}
