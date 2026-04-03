package com.cts.mfrp.petzbackend.common.service;

import com.cts.mfrp.petzbackend.ngo.model.Ngo;

import java.util.UUID;

/**
 * Unified notification service — combines NGO siren alerts,
 * mission claim notifications, and rescue workflow notifications.
 *
 * Stub implementation provided for development; replace with
 * Firebase/push notifications in production.
 */
public interface NotificationService {

    // ── NGO notifications ────────────────────────────────────────
    void sendSirenAlert(Ngo ngo, double sosLat, double sosLon);

    void notifyOthersMissionClaimed(UUID missionId, UUID ngoId);

    // ── Rescue workflow notifications ────────────────────────────
    void notifyReporter(UUID reporterId, String message);

    void notifyVolunteer(UUID volunteerId, String message);

    void sendIncomingRescueAlert(UUID hospitalOwnerId, UUID sosReportId, String animalCondition);
}
