package com.petz.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

/**
 * Handles WebSocket STOMP messages.
 * Clients connect to /ws (SockJS), subscribe to /user/{userId}/queue/notifications.
 */
@Controller
public class NotificationWsController {

    /**
     * Client can send /app/ping to keep connection alive.
     */
    @MessageMapping("/ping")
    public void ping(@Payload String message, SimpMessageHeaderAccessor accessor) {
        // no-op — just keep the session alive
    }
}
