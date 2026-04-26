package com.cts.mfrp.petzbackend.adoption.controller;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionCompletionDtos.AdoptionResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionCompletionDtos.ScheduleHandoverRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionFollowUpDtos.FollowUpResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionFollowUpDtos.RecordFollowUpRequest;
import com.cts.mfrp.petzbackend.adoption.service.AdoptionCompletionService;
import com.cts.mfrp.petzbackend.adoption.service.AdoptionFollowUpService;
import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Epic 2.5 — handover + finalization + follow-up endpoints.
 *
 * NGO-facing (requires ngo binding):
 *   POST   /api/v1/ngo/adoptions/schedule                           US-2.5.1
 *   POST   /api/v1/ngo/adoptions/{id}/confirm-handover              US-2.5.1+2.5.2+2.5.3+2.5.5
 *   GET    /api/v1/ngo/adoptions                                    NGO history
 *   PATCH  /api/v1/ngo/adoptions/{id}/follow-ups/{followUpId}       US-2.5.4
 *
 * Adopter / public read:
 *   GET    /api/v1/adoptions/mine                                   adopter history
 *   GET    /api/v1/adoptions/{id}                                   admin / deep-link
 *   GET    /api/v1/adoptions/{id}/follow-ups                        timeline
 */
@RestController
@RequiredArgsConstructor
public class AdoptionCompletionController {

    private final AdoptionCompletionService completionService;
    private final AdoptionFollowUpService   followUpService;
    private final UserRepository            userRepo;

    // ── NGO endpoints ───────────────────────────────────────────────

    @PostMapping("/api/v1/ngo/adoptions/schedule")
    public ResponseEntity<ApiResponse<AdoptionResponse>> schedule(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @Valid @RequestBody ScheduleHandoverRequest body) {
        UUID reviewerId = resolveActor(principalUserId, headerUserId);
        UUID ngoId      = resolveNgoId(reviewerId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Handover scheduled.",
                completionService.scheduleHandover(reviewerId, ngoId, body)));
    }

    @PostMapping("/api/v1/ngo/adoptions/{id}/confirm-handover")
    public ResponseEntity<ApiResponse<AdoptionResponse>> confirm(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id) {
        UUID reviewerId = resolveActor(principalUserId, headerUserId);
        UUID ngoId      = resolveNgoId(reviewerId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Adoption finalized. Pet linked to hospital module.",
                completionService.confirmHandover(reviewerId, ngoId, id)));
    }

    @GetMapping("/api/v1/ngo/adoptions")
    public ResponseEntity<ApiResponse<List<AdoptionResponse>>> ngoHistory(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {
        UUID reviewerId = resolveActor(principalUserId, headerUserId);
        UUID ngoId      = resolveNgoId(reviewerId);
        return ResponseEntity.ok(ApiResponse.ok(
                "NGO adoptions fetched.",
                completionService.listForNgo(ngoId)));
    }

    @PatchMapping("/api/v1/ngo/adoptions/{id}/follow-ups/{followUpId}")
    public ResponseEntity<ApiResponse<FollowUpResponse>> recordFollowUp(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @PathVariable UUID followUpId,
            @Valid @RequestBody RecordFollowUpRequest body) {
        UUID reviewerId = resolveActor(principalUserId, headerUserId);
        UUID ngoId      = resolveNgoId(reviewerId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Follow-up recorded.",
                followUpService.record(reviewerId, ngoId, id, followUpId, body)));
    }

    // ── Adopter / public read endpoints ─────────────────────────────

    @GetMapping("/api/v1/adoptions/mine")
    public ResponseEntity<ApiResponse<List<AdoptionResponse>>> myAdoptions(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Your adoptions fetched.",
                completionService.listForAdopter(adopterId)));
    }

    @GetMapping("/api/v1/adoptions/{id}")
    public ResponseEntity<ApiResponse<AdoptionResponse>> byId(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Adoption fetched.", completionService.getById(id)));
    }

    @GetMapping("/api/v1/adoptions/{id}/follow-ups")
    public ResponseEntity<ApiResponse<List<FollowUpResponse>>> listFollowUps(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Follow-ups fetched.", followUpService.listForAdoption(id)));
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private UUID resolveActor(UUID principalUserId, UUID headerUserId) {
        if (principalUserId != null) return principalUserId;
        if (headerUserId    != null) return headerUserId;
        throw new IllegalArgumentException(
                "Missing caller identity — authenticate or send X-User-Id header in dev.");
    }

    private UUID resolveNgoId(UUID userId) {
        Optional<User> u = userRepo.findById(userId);
        return u.map(User::getNgoId).orElse(null);
    }
}
