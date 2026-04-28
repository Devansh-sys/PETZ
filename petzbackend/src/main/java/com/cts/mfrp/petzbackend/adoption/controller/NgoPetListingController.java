package com.cts.mfrp.petzbackend.adoption.controller;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.ArchiveRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.CreateRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.Detail;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.FilterRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.Summary;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.UpdateRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionMediaDtos.MediaResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionMediaDtos.ReorderRequest;
import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.adoption.service.AdoptablePetService;
import com.cts.mfrp.petzbackend.adoption.service.AdoptionMediaService;
import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Epic 2.2 — NGO-facing endpoints for managing their own adoption listings.
 *
 * Auth contract:
 *   - The filter chain authenticates NGO_REP users via JWT. The authenticated
 *     principal (user id) comes through as {@code @AuthenticationPrincipal}.
 *   - The service resolves the caller's {@code ngoId} from {@code User.ngoId}
 *     and passes it to every mutation so NGOs can only touch their own pets.
 *   - In dev (permitAll security) an optional {@code X-User-Id} header is
 *     honoured so Postman / curl can hit these without a JWT.
 *
 *   POST   /api/v1/ngo/adoptable-pets                  US-2.2.1
 *   GET    /api/v1/ngo/adoptable-pets                  US-2.2.1 dashboard view
 *   PATCH  /api/v1/ngo/adoptable-pets/{petId}          US-2.2.2
 *   POST   /api/v1/ngo/adoptable-pets/{petId}/media    US-2.2.3
 *   GET    /api/v1/ngo/adoptable-pets/{petId}/media    US-2.2.3
 *   PATCH  /api/v1/ngo/adoptable-pets/{petId}/media/order           US-2.2.3
 *   PATCH  /api/v1/ngo/adoptable-pets/{petId}/media/{mediaId}/primary US-2.2.3
 *   DELETE /api/v1/ngo/adoptable-pets/{petId}/media/{mediaId}       US-2.2.3
 *   POST   /api/v1/ngo/adoptable-pets/{petId}/archive               US-2.2.4
 */
@RestController
@RequestMapping("/api/v1/ngo/adoptable-pets")
@RequiredArgsConstructor
// US-4.1.3 — NGO_REP or ADMIN only when JWT is present. Dev-mode fallback
// (no JWT) stays open so existing X-User-Id test flows keep working.
@PreAuthorize("hasAnyRole('NGO_REP','ADMIN') or !isAuthenticated()")
public class NgoPetListingController {

    private final AdoptablePetService  petService;
    private final AdoptionMediaService mediaService;
    private final UserRepository       userRepo;

    // US-2.2.1 — create listing
    @PostMapping
    public ResponseEntity<ApiResponse<Detail>> create(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @Valid @RequestBody CreateRequest body) {
        UUID actorId  = resolveActor(principalUserId, headerUserId);
        UUID ngoId    = resolveNgoId(actorId);
        Detail created = petService.createListing(actorId, ngoId, body);
        return ResponseEntity.ok(ApiResponse.ok(
                "Pet listing published.", created));
    }

    // US-2.2.1 AC#1 — NGO dashboard view (includes archived)
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Summary>>> listMine(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID actorId = resolveActor(principalUserId, headerUserId);
        UUID ngoId   = resolveNgoId(actorId);
        // Simple filter — NGO dashboard only filters by species/breed/status
        // via reused FilterRequest plus a status column lookup. For Wave 1
        // we just filter by ngo + optional "LISTED/ARCHIVED" via sort hint.
        FilterRequest filter = new FilterRequest();
        PageResponse<Summary> data =
                petService.listForNgo(ngoId, filter, sort, page, size);
        return ResponseEntity.ok(ApiResponse.ok("NGO listings fetched.", data));
    }

    // US-2.2.2 — partial update
    @PatchMapping("/{petId}")
    public ResponseEntity<ApiResponse<Detail>> update(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID petId,
            @Valid @RequestBody UpdateRequest body) {
        UUID actorId = resolveActor(principalUserId, headerUserId);
        UUID ngoId   = resolveNgoId(actorId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Pet listing updated.", petService.updateListing(actorId, ngoId, petId, body)));
    }

    // US-2.2.4 — archive
    @PostMapping("/{petId}/archive")
    public ResponseEntity<ApiResponse<Detail>> archive(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID petId,
            @Valid @RequestBody ArchiveRequest body) {
        UUID actorId = resolveActor(principalUserId, headerUserId);
        UUID ngoId   = resolveNgoId(actorId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Pet listing archived.",
                petService.archiveListing(actorId, ngoId, petId, body.getReason())));
    }

    // ── US-2.2.3 Media gallery ──────────────────────────────────────

    @GetMapping("/{petId}/media")
    public ResponseEntity<ApiResponse<List<MediaResponse>>> listMedia(
            @PathVariable UUID petId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Media fetched.", mediaService.listMedia(petId)));
    }

    @PostMapping("/{petId}/media")
    public ResponseEntity<ApiResponse<MediaResponse>> uploadMedia(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID petId,
            @RequestPart("file") MultipartFile file) {
        UUID actorId = resolveActor(principalUserId, headerUserId);
        UUID ngoId   = resolveNgoId(actorId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Media uploaded.",
                mediaService.upload(actorId, ngoId, petId, file)));
    }

    @PatchMapping("/{petId}/media/order")
    public ResponseEntity<ApiResponse<List<MediaResponse>>> reorderMedia(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID petId,
            @Valid @RequestBody ReorderRequest body) {
        UUID actorId = resolveActor(principalUserId, headerUserId);
        UUID ngoId   = resolveNgoId(actorId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Media reordered.",
                mediaService.reorder(actorId, ngoId, petId, body.getOrder())));
    }

    @PatchMapping("/{petId}/media/{mediaId}/primary")
    public ResponseEntity<ApiResponse<MediaResponse>> setPrimary(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID petId,
            @PathVariable UUID mediaId) {
        UUID actorId = resolveActor(principalUserId, headerUserId);
        UUID ngoId   = resolveNgoId(actorId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Primary image updated.",
                mediaService.setPrimary(actorId, ngoId, petId, mediaId)));
    }

    @DeleteMapping("/{petId}/media/{mediaId}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID petId,
            @PathVariable UUID mediaId) {
        UUID actorId = resolveActor(principalUserId, headerUserId);
        UUID ngoId   = resolveNgoId(actorId);
        mediaService.delete(actorId, ngoId, petId, mediaId);
        return ResponseEntity.ok(ApiResponse.ok("Media deleted.", null));
    }

    // ─── helpers ─────────────────────────────────────────────────────

    /**
     * Prefer the authenticated principal; fall back to {@code X-User-Id}
     * header for dev/test convenience (since hospital endpoints are
     * currently {@code permitAll}). Null → 401.
     */
    private UUID resolveActor(UUID principalUserId, UUID headerUserId) {
        if (principalUserId != null) return principalUserId;
        if (headerUserId    != null) return headerUserId;
        throw new IllegalArgumentException(
                "Missing caller identity — authenticate or send X-User-Id header in dev.");
    }

    /**
     * Map the acting user to their NGO. NGO_REP users should have
     * {@code User.ngoId} populated — if it's still null (dev seed not done),
     * we return null and let the service fall back to the body-supplied
     * ngoId (CreateRequest only) or throw 400 otherwise.
     */
    private UUID resolveNgoId(UUID userId) {
        Optional<User> user = userRepo.findById(userId);
        return user.map(User::getNgoId).orElse(null);
    }
}
