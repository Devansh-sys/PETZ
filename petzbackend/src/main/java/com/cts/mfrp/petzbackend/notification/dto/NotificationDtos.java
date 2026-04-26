package com.cts.mfrp.petzbackend.notification.dto;

import com.cts.mfrp.petzbackend.notification.enums.NotificationType;
import com.cts.mfrp.petzbackend.notification.model.Notification;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-4.2.1 — DTOs for the notification inbox API.
 */
public class NotificationDtos {

    private NotificationDtos() {}

    // ─── Response ─────────────────────────────────────────────────────────

    /**
     * Single notification shown in the inbox list or detail view.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NotificationResponse {
        private UUID             id;
        private NotificationType type;
        private String           title;
        private String           body;
        private UUID             referenceId;
        private String           referenceType;
        private boolean          read;
        private LocalDateTime    createdAt;
        private LocalDateTime    readAt;

        /** Map entity → DTO. */
        public static NotificationResponse from(Notification n) {
            return NotificationResponse.builder()
                    .id(n.getId())
                    .type(n.getType())
                    .title(n.getTitle())
                    .body(n.getBody())
                    .referenceId(n.getReferenceId())
                    .referenceType(n.getReferenceType())
                    .read(n.isReadSafe())
                    .createdAt(n.getCreatedAt())
                    .readAt(n.getReadAt())
                    .build();
        }
    }

    // ─── Unread badge ─────────────────────────────────────────────────────

    /**
     * Lightweight response for the badge / tab dot on the frontend.
     * GET /api/v1/users/me/notifications/unread-count
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnreadCountResponse {
        private long count;
    }
}
