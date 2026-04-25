package com.cts.mfrp.petzbackend.notification.controller;

import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.notification.dto.NotificationDtos.NotificationResponse;
import com.cts.mfrp.petzbackend.notification.dto.NotificationDtos.UnreadCountResponse;
import com.cts.mfrp.petzbackend.notification.service.InAppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * US-4.2.1 — in-app notification inbox for the authenticated user.
 *
 *   GET    /api/v1/users/me/notifications                  paginated inbox
 *   GET    /api/v1/users/me/notifications/unread-count      badge count
 *   PATCH  /api/v1/users/me/notifications/{id}/read         mark one read
 *   PATCH  /api/v1/users/me/notifications/read-all          mark all read
 *   DELETE /api/v1/users/me/notifications/{id}              dismiss
 *
 * Auth: JWT principal wins; X-User-Id header is the dev-mode fallback.
 */
@RestController
@RequestMapping("/api/v1/users/me/notifications")
@RequiredArgsConstructor
public class UserNotificationController {

    private final InAppNotificationService notifService;

    // ─── List inbox ───────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> list(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Notifications fetched.",
                notifService.list(userId, unreadOnly, page, size)));
    }

    // ─── Badge count ──────────────────────────────────────────────────────

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> unreadCount(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {
        UUID userId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Unread count fetched.", notifService.unreadCount(userId)));
    }

    // ─── Mark one read ────────────────────────────────────────────────────

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markRead(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id) {
        UUID userId = resolveActor(principalUserId, headerUserId);
        return ResponseEntity.ok(ApiResponse.ok(
                "Notification marked as read.", notifService.markRead(userId, id)));
    }

    // ─── Mark all read ────────────────────────────────────────────────────

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId) {
        UUID userId = resolveActor(principalUserId, headerUserId);
        int updated = notifService.markAllRead(userId);
        return ResponseEntity.ok(ApiResponse.ok(
                updated + " notification(s) marked as read.", null));
    }

    // ─── Dismiss (delete) ─────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> dismiss(
            @AuthenticationPrincipal UUID principalUserId,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @PathVariable UUID id) {
        UUID userId = resolveActor(principalUserId, headerUserId);
        notifService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.ok("Notification dismissed.", null));
    }

    // ─── helpers ──────────────────────────────────────────────────────────

    private UUID resolveActor(UUID principalUserId, UUID headerUserId) {
        if (principalUserId != null) return principalUserId;
        if (headerUserId    != null) return headerUserId;
        throw new IllegalArgumentException(
                "Missing caller identity — authenticate or send X-User-Id header in dev.");
    }
}
