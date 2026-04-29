package com.cts.mfrp.petzbackend.adoption.controller;

import com.cts.mfrp.petzbackend.common.exception.AuthExceptions;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.ConsentSection;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.Detail;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.ExperienceSection;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.LifestyleSection;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.PersonalSection;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.StartRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.Summary;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.WithdrawRequest;
import com.cts.mfrp.petzbackend.adoption.dto.KycDocumentDtos.DocumentResponse;
import com.cts.mfrp.petzbackend.adoption.service.AdoptionApplicationService;
import com.cts.mfrp.petzbackend.adoption.service.KycDocumentService;
import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Epic 2.3 — adopter-facing endpoints.
 *
 *   POST   /api/v1/adoption-applications                          US-2.3.1
 *   PATCH  /api/v1/adoption-applications/{id}/personal            US-2.3.2
 *   PATCH  /api/v1/adoption-applications/{id}/lifestyle           US-2.3.2
 *   PATCH  /api/v1/adoption-applications/{id}/experience          US-2.3.2
 *   PATCH  /api/v1/adoption-applications/{id}/consent             US-2.3.2
 *   POST   /api/v1/adoption-applications/{id}/submit              US-2.3.3
 *   POST   /api/v1/adoption-applications/{id}/documents           US-2.3.4
 *   GET    /api/v1/adoption-applications/{id}/documents           US-2.3.4
 *   GET    /api/v1/adoption-applications/{id}                     US-2.3.5
 *   GET    /api/v1/adoption-applications/mine                     US-2.3.5
 *   POST   /api/v1/adoption-applications/{id}/withdraw            US-2.3.6
 *
 * Auth: accepts authenticated principal; dev mode falls back to the
 * {@code X-User-Id} header (same pattern as Wave 1 NGO endpoints) so
 * curl / Postman can exercise it without wrangling JWTs.
 */
@RestController
@RequestMapping("/api/v1/adoption-applications")
@RequiredArgsConstructor
public class AdoptionApplicationController {

    private final AdoptionApplicationService applicationService;
    private final KycDocumentService         kycService;

    // US-2.3.1 Start
    @PostMapping
    public ResponseEntity<ApiResponse<Detail>> start(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @Valid @RequestBody StartRequest body) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        Detail created = applicationService.start(adopterId, body);
        return ResponseEntity.ok(
                ApiResponse.ok("Adoption application started.", created));
    }

    // US-2.3.5 mine (list before detail so /mine isn't caught by /{id})
    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<Summary>>> mine(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Your applications fetched.",
                applicationService.listMine(adopterId)));
    }

    // US-2.3.5 detail
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Detail>> getDetail(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Application fetched.",
                applicationService.getDetail(adopterId, id)));
    }

    // US-2.3.2 step patches
    @PatchMapping("/{id}/personal")
    public ResponseEntity<ApiResponse<Detail>> patchPersonal(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @Valid @RequestBody PersonalSection body) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Personal section saved.",
                applicationService.patchPersonal(adopterId, id, body)));
    }

    @PatchMapping("/{id}/lifestyle")
    public ResponseEntity<ApiResponse<Detail>> patchLifestyle(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @Valid @RequestBody LifestyleSection body) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Lifestyle section saved.",
                applicationService.patchLifestyle(adopterId, id, body)));
    }

    @PatchMapping("/{id}/experience")
    public ResponseEntity<ApiResponse<Detail>> patchExperience(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @Valid @RequestBody ExperienceSection body) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Experience section saved.",
                applicationService.patchExperience(adopterId, id, body)));
    }

    @PatchMapping("/{id}/consent")
    public ResponseEntity<ApiResponse<Detail>> patchConsent(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @Valid @RequestBody ConsentSection body) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Consent section saved.",
                applicationService.patchConsent(adopterId, id, body)));
    }

    // US-2.3.3 submit
    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<Detail>> submit(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Application submitted. Status: PENDING review.",
                applicationService.submit(adopterId, id)));
    }

    // US-2.3.6 withdraw
    @PostMapping("/{id}/withdraw")
    public ResponseEntity<ApiResponse<Detail>> withdraw(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @RequestBody(required = false) WithdrawRequest body) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Application withdrawn.",
                applicationService.withdraw(adopterId, id, body)));
    }

    // US-2.3.4 KYC upload + list
    @PostMapping("/{id}/documents")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id,
            @RequestParam("docType") String docType,
            @RequestPart("file") MultipartFile file) {
        UUID adopterId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "KYC document uploaded.",
                kycService.upload(adopterId, id, docType, file)));
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> listDocuments(
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(
                "KYC documents fetched.", kycService.list(id)));
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private UUID resolveActor(UUID principalUserId, UUID headerUserId) {
        if (principalUserId != null) return principalUserId;
        if (headerUserId    != null) return headerUserId;
        throw new AuthExceptions.UnauthenticatedException();
    }
}
