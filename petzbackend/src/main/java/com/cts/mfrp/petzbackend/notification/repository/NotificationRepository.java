package com.cts.mfrp.petzbackend.notification.repository;

import com.cts.mfrp.petzbackend.notification.model.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

/**
 * US-4.2.1 — data access for in-app notifications.
 */
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /** All notifications for a user, newest first. */
    Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /** Unread-only inbox. */
    Page<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /** Unread badge count. */
    long countByUserIdAndIsReadFalse(UUID userId);

    /** Mark all unread → read in one UPDATE. */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP " +
           "WHERE n.userId = :userId AND n.isRead = false")
    int markAllRead(@Param("userId") UUID userId);

    /** Delete all notifications for a user (account cleanup). */
    void deleteByUserId(UUID userId);
}
