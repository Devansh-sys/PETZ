package com.cts.mfrp.petzbackend.adoption.controller;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.ApproveRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.ClarifyRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.Detail;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.RejectRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.Summary;
import com.cts.mfrp.petzbackend.adoption.dto.KycDocumentDtos.DocumentResponse;
import com.cts.mfrp.petzbackend.adoption.dto.KycDocumentDtos.VerifyRequest;
import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.adoption.service.AdoptionReviewService;
import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ngo/adoption-applications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('NGO_REP','ADMIN') or !isAuthenticated()")
public class AdoptionReviewController {

    private final AdoptionReviewService reviewService;
    private final UserRepository        userRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Summary>>> list(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID   petId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Boolean unreviewed,
            @RequestParam(required = false) String  sort,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID ngoId = resolveNgoId(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Applications fetched.",
                reviewService.list(ngoId, status, petId, from, to, unreviewed, sort, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Detail>> detail(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id) {
        UUID ngoId = resolveNgoId(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok("Application detail fetched.", reviewService.getDetail(ngoId, id)));
    }

    @PostMapping("/{id}/review-start")
    public ResponseEntity<ApiResponse<Detail>> startReview(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id) {
        UUID reviewerId = resolveActor(principalUserId, headerUserId);
        UUID ngoId      = resolveNgoId(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok("Review started.", reviewService.startReview(reviewerId, ngoId, id)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Detail>> approve(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @Valid @RequestBody ApproveRequest body) {
        UUID reviewerId = resolveActor(principalUserId, headerUserId);
        UUID ngoId      = resolveNgoId(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok("Application approved.", reviewService.approve(reviewerId, ngoId, id, body)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Detail>> reject(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @Valid @RequestBody RejectRequest body) {
        UUID reviewerId = resolveActor(principalUserId, headerUserId);
        UUID ngoId      = resolveNgoId(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok("Application rejected.", reviewService.reject(reviewerId, ngoId, id, body)));
    }

    @PostMapping("/{id}/clarify")
    public ResponseEntity<ApiResponse<Detail>> clarify(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @Valid @RequestBody ClarifyRequest body) {
        UUID reviewerId = resolveActor(principalUserId, headerUserId);
        UUID ngoId      = resolveNgoId(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok("Clarification requested.", reviewService.clarify(reviewerId, ngoId, id, body)));
    }

    @PostMapping("/{id}/documents/{docId}/verify")
    public ResponseEntity<ApiResponse<DocumentResponse>> verifyDocument(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @PathVariable UUID docId,
            @Valid @RequestBody VerifyRequest body) {
        UUID reviewerId = resolveActor(principalUserId, headerUserId);
        UUID ngoId      = resolveNgoId(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok("KYC verification recorded.",
                reviewService.verifyDocument(reviewerId, ngoId, id, docId, body.getStatus(), body.getReason())));
    }

    private UUID resolveActor(UUID principalUserId, UUID headerUserId) {
        if (principalUserId != null) return principalUserId;
        if (headerUserId    != null) return headerUserId;
        throw new IllegalArgumentException("Missing caller identity — authenticate or send X-User-Id header in dev.");
    }

    private UUID resolveNgoId(UUID principalUserId, UUID headerUserId) {
        UUID actor = resolveActor(principalUserId, headerUserId);
        Optional<User> user = userRepo.findById(actor);
        return user.map(User::getNgoId).orElse(null);
    }
}
