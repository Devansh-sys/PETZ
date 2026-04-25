package com.cts.mfrp.petzbackend.notification.model;

import com.cts.mfrp.petzbackend.notification.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-4.2.1 — persistent in-app notification row.
 *
 * One row per (user, event). The frontend polls
 * GET /api/v1/users/me/notifications to build the inbox.
 * Unread badge uses the unread-count endpoint.
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_user_created", columnList = "user_id, created_at DESC"),
        @Index(name = "idx_notif_user_unread",  columnList = "user_id, is_read")
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Recipient — always a concrete user id. */
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 60)
    private NotificationType type;

    /** Short title shown in the notification list item. */
    @Column(nullable = false, length = 200)
    private String title;

    /** Full body text shown in the detail / expanded view. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    /**
     * Optional FK to the related entity (appointment id, application id, etc.).
     * Frontend uses this to navigate to the detail screen on tap.
     */
    @Column(name = "reference_id")
    private UUID referenceId;

    /**
     * Human-readable name of the reference type:
     * "APPOINTMENT", "APPLICATION", "ADOPTION", "DISPUTE", etc.
     */
    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "is_read", columnDefinition = "bit(1) default 0")
    private Boolean isRead;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (isRead == null)    isRead    = false;
    }

    /** Null-safe read check. */
    public boolean isReadSafe() {
        return Boolean.TRUE.equals(isRead);
    }
}
