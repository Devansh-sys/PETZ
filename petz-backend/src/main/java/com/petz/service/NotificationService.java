package com.petz.service;

import com.petz.entity.Notification;
import com.petz.enums.NotificationType;
import com.petz.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final SimpMessagingTemplate messagingTemplate;

    public Notification notifyUser(Long userId, String title, String message, Long refId, String refType) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setMessage(message);
        n.setRefId(refId);
        n.setRefType(refType);
        n.setType(resolveType(refType));
        n = notificationRepo.save(n);

        // push via WebSocket to user-specific queue
        try {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    n
            );
        } catch (Exception ignored) {
            // WebSocket push is best-effort
        }

        return n;
    }

    public List<Notification> getForUser(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnread(Long userId) {
        return notificationRepo.findByUserIdAndIsRead(userId, false);
    }

    public long countUnread(Long userId) {
        return notificationRepo.countByUserIdAndIsRead(userId, false);
    }

    public void markRead(Long notificationId, Long userId) {
        notificationRepo.findById(notificationId).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setIsRead(true);
                notificationRepo.save(n);
            }
        });
    }

    public void markAllRead(Long userId) {
        List<Notification> unread = notificationRepo.findByUserIdAndIsRead(userId, false);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepo.saveAll(unread);
    }

    private NotificationType resolveType(String refType) {
        if (refType == null) return NotificationType.GENERAL;
        return switch (refType.toUpperCase()) {
            case "APPOINTMENT" -> NotificationType.APPOINTMENT_CONFIRMED;
            case "RESCUE"      -> NotificationType.RESCUE_ASSIGNED;
            case "ADOPTION"    -> NotificationType.ADOPTION_UPDATE;
            default            -> NotificationType.GENERAL;
        };
    }
}
