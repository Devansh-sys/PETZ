package com.cts.mfrp.petzbackend.ngo.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.ngo.dto.NgoRegistrationDtos.*;
import com.cts.mfrp.petzbackend.ngo.service.NgoRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * US-4.3 — NGO self-registration and profile management.
 *
 *   POST  /api/v1/ngo/register    create a new NGO (NGO_REP only)
 *   GET   /api/v1/ngo/profile     view own NGO profile
 *   PATCH /api/v1/ngo/profile     update own NGO profile
 *   GET   /api/v1/ngo/dashboard   aggregated stats dashboard
 *
 * Auth: JWT principal wins; X-User-Id header is the dev-mode fallback.
 * Class-level @PreAuthorize mirrors the existing NGO controllers.
 */
@RestController
@RequestMapping("/api/v1/ngo")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('NGO_REP','ADMIN') or !isAuthenticated()")
public class NgoProfileController {

    private final NgoRegistrationService ngoService;

    // ─── Registration ─────────────────────────────────────────────────────

    /**
     * US-4.3 — any NGO_REP with no existing NGO can call this once.
     * Returns 201 Created on success.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<NgoProfileResponse>> register(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @Valid @RequestBody RegisterNgoRequest body) {
        UUID callerId = resolveActor(principalUserId, headerUserId);
        NgoProfileResponse created = ngoService.register(callerId, body);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("NGO registered successfully. Pending admin verification.", created));
    }

    // ─── Profile view ─────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<NgoProfileResponse>> profile(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {
        UUID callerId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "NGO profile fetched.", ngoService.getProfile(callerId)));
    }

    // ─── Profile update ───────────────────────────────────────────────────

    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<NgoProfileResponse>> updateProfile(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @Valid @RequestBody NgoUpdateRequest body) {
        UUID callerId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "NGO profile updated.", ngoService.updateProfile(callerId, body)));
    }

    // ─── Dashboard ────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<NgoDashboardResponse>> dashboard(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {
        UUID callerId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "NGO dashboard fetched.", ngoService.getDashboard(callerId)));
    }

    // ─── helpers ──────────────────────────────────────────────────────────

    private UUID resolveActor(UUID principalUserId, UUID headerUserId) {
        if (principalUserId != null) return principalUserId;
        if (headerUserId    != null) return headerUserId;
        throw new IllegalArgumentException(
                "Missing caller identity — authenticate or send X-User-Id header in dev.");
    }
}
