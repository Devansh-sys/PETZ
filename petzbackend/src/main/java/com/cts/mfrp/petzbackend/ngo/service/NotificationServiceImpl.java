package com.cts.mfrp.petzbackend.ngo.service;

import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Stub implementation of NotificationService.
 * Logs instead of sending real notifications.
 * Replace with Firebase push notifications later.
 */
@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    @Override
    public void sendSirenAlert(Ngo ngo, double sosLat, double sosLon) {
        log.info("SIREN ALERT → NGO '{}' notified for rescue at [{}, {}]",
                ngo.getName(), sosLat, sosLon);
    }

    @Override
    public void notifyOthersMissionClaimed(UUID missionId, UUID ngoId) {
        log.info("NOTIFICATION → Mission {} claimed by NGO {}. Other NGOs notified.",
                missionId, ngoId);
    }
}