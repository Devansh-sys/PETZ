package com.cts.mfrp.petzbackend.notification.service;

import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.notification.dto.NotificationDtos.NotificationResponse;
import com.cts.mfrp.petzbackend.notification.dto.NotificationDtos.UnreadCountResponse;
import com.cts.mfrp.petzbackend.notification.enums.NotificationType;
import com.cts.mfrp.petzbackend.notification.model.Notification;
import com.cts.mfrp.petzbackend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-4.2.1 — in-app notification inbox logic.
 *
 * Called from two places:
 *   1. NotificationServiceStub — every platform event persists a row here.
 *   2. UserNotificationController — user reads / dismisses their inbox.
 */
@Service
@RequiredArgsConstructor
public class InAppNotificationService {

    private static final Logger log = LoggerFactory.getLogger(InAppNotificationService.class);

    private final NotificationRepository notificationRepo;

    // ─── Write ────────────────────────────────────────────────────────────

    /**
     * Persist a new notification. Called by NotificationServiceStub for
     * every platform event that targets a concrete userId.
     *
     * Silent on failure — notification persistence must never break the
     * main business transaction that triggered it.
     */
    @Transactional
    public Notification create(UUID userId,
                               NotificationType type,
                               String title,
                               String body,
                               UUID referenceId,
                               String referenceType) {
        Notification n = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
        Notification saved = notificationRepo.save(n);
        log.debug("[NOTIF] {} → user={} ref={}", type, userId, referenceId);
        return saved;
    }

    // Convenience overload — no reference entity.
    @Transactional
    public Notification create(UUID userId, NotificationType type,
                               String title, String body) {
        return create(userId, type, title, body, null, null);
    }

    // ─── Read ─────────────────────────────────────────────────────────────

    /**
     * US-4.2.1 — paginated inbox.
     * @param unreadOnly true → only unread items (for the filtered view)
     */
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> list(UUID userId,
                                                   boolean unreadOnly,
                                                   int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        var pageResult = unreadOnly
                ? notificationRepo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId, pageable)
                : notificationRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return PageResponse.from(pageResult, NotificationResponse::from);
    }

    /**
     * US-4.2.1 — badge count for unread notifications.
     */
    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount(UUID userId) {
        return new UnreadCountResponse(notificationRepo.countByUserIdAndIsReadFalse(userId));
    }

    // ─── Mutations ────────────────────────────────────────────────────────

    /**
     * US-4.2.1 — mark a single notification as read.
     * Only the owner can mark their own notification.
     */
    @Transactional
    public NotificationResponse markRead(UUID userId, UUID notificationId) {
        Notification n = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found: " + notificationId));
        if (!n.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to this user.");
        }
        if (!n.isReadSafe()) {
            n.setIsRead(true);
            n.setReadAt(LocalDateTime.now());
            n = notificationRepo.save(n);
        }
        return NotificationResponse.from(n);
    }

    /**
     * US-4.2.1 — mark ALL unread notifications as read (bulk).
     * Returns count of rows updated.
     */
    @Transactional
    public int markAllRead(UUID userId) {
        return notificationRepo.markAllRead(userId);
    }

    /**
     * US-4.2.1 — dismiss (delete) a single notification.
     */
    @Transactional
    public void delete(UUID userId, UUID notificationId) {
        Notification n = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found: " + notificationId));
        if (!n.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to this user.");
        }
        notificationRepo.delete(n);
    }
}
