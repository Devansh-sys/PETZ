package com.cts.mfrp.petzbackend.adoption.controller;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionDisputeDtos.DisputeResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionDisputeDtos.RaiseDisputeRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionDisputeDtos.ResolveDisputeRequest;
import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.adoption.service.AdoptionDisputeService;
import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * US-2.6.3 — adoption disputes.
 *
 *   User-facing:
 *     POST  /api/v1/adoptions/disputes                 raise a dispute
 *
 *   Admin-facing:
 *     GET   /admin/adoptions/disputes[?status=OPEN]    queue
 *     GET   /admin/adoptions/disputes/{id}             full detail
 *     POST  /admin/adoptions/disputes/{id}/resolve     OVERRIDE/WARN/SUSPEND
 */
@RestController
@RequiredArgsConstructor
public class AdoptionDisputeController {

    private final AdoptionDisputeService disputeService;

    // Any authenticated user can raise (adopter OR NGO staff).
    @PostMapping("/api/v1/adoptions/disputes")
    public ResponseEntity<ApiResponse<DisputeResponse>> raise(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @Valid @RequestBody RaiseDisputeRequest body) {
        UUID raiserId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Dispute raised.", disputeService.raise(raiserId, body)));
    }

    // Admin queue (US-4.1.3 — ADMIN only when JWT present; dev fallback allowed).
    @GetMapping("/admin/adoptions/disputes")
    @PreAuthorize("hasRole('ADMIN') or !isAuthenticated()")
    public ResponseEntity<ApiResponse<PageResponse<DisputeResponse>>> list(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Disputes fetched.", disputeService.list(status, page, size)));
    }

    @GetMapping("/admin/adoptions/disputes/{id}")
    @PreAuthorize("hasRole('ADMIN') or !isAuthenticated()")
    public ResponseEntity<ApiResponse<DisputeResponse>> detail(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Dispute detail fetched.", disputeService.getById(id)));
    }

    @PostMapping("/admin/adoptions/disputes/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN') or !isAuthenticated()")
    public ResponseEntity<ApiResponse<DisputeResponse>> resolve(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @Valid @RequestBody ResolveDisputeRequest body) {
        UUID adminId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Dispute resolved.", disputeService.resolve(adminId, id, body)));
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private UUID resolveActor(UUID principalUserId, UUID headerUserId) {
        if (principalUserId != null) return principalUserId;
        if (headerUserId    != null) return headerUserId;
        throw new IllegalArgumentException(
                "Missing caller identity — authenticate or send X-User-Id header in dev.");
    }
}
