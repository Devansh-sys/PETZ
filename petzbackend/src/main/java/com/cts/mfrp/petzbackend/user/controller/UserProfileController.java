package com.cts.mfrp.petzbackend.user.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.user.dto.RegistrationDtos.PasswordChangeRequest;
import com.cts.mfrp.petzbackend.user.dto.RegistrationDtos.ProfileResponse;
import com.cts.mfrp.petzbackend.user.dto.RegistrationDtos.ProfileUpdateRequest;
import com.cts.mfrp.petzbackend.user.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Epic 4.1 — self-service profile endpoints.
 *
 *   GET    /api/v1/users/me            US-4.1.4 view profile
 *   PATCH  /api/v1/users/me            US-4.1.4 edit profile
 *   POST   /api/v1/users/me/password   US-4.1.4 change password
 *   POST   /api/v1/users/me/photo      US-4.1.4 upload profile photo
 *
 * Caller identity resolution follows the platform convention used by
 * Adoption and Hospital controllers: authenticated JWT principal wins;
 * {@code X-User-Id} header is the dev-mode fallback so existing test
 * curls keep working.
 */
@RestController
@RequestMapping("/api/v1/users/me")
public class UserProfileController {

    private final UserProfileService profileService;

    public UserProfileController(UserProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> me(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {
        UUID userId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Profile fetched.", profileService.getProfile(userId)));
    }

    @PatchMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateMe(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @Valid @RequestBody ProfileUpdateRequest body) {
        UUID userId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Profile updated.", profileService.updateProfile(userId, body)));
    }

    @PostMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @Valid @RequestBody PasswordChangeRequest body) {
        UUID userId = resolveActor(principalUserId, headerUserId);
        profileService.changePassword(userId, body);
        return ResponseEntity.ok(ApiResponse.ok("Password updated.", null));
    }

    @PostMapping(value = "/photo", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProfileResponse>> uploadPhoto(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam("file") MultipartFile file) {
        UUID userId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Profile photo uploaded.",
                profileService.uploadProfilePhoto(userId, file)));
    }

    // ─── helpers ─────────────────────────────────────────────────────────

    private UUID resolveActor(UUID principalUserId, UUID headerUserId) {
        if (principalUserId != null) return principalUserId;
        if (headerUserId != null)    return headerUserId;
        throw new IllegalArgumentException(
                "Missing caller identity — authenticate or send X-User-Id header in dev.");
    }
}
