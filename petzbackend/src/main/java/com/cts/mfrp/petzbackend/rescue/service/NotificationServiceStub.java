package com.cts.mfrp.petzbackend.rescue.service; // ✅ must match NotificationService.java package exactly

import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * TEMPORARY STUB — delete this once the Notifications module collaborator
 * provides the real @Service implementation of NotificationService.
 *
 * This only exists so the app can start without the notifications module.
 */
@Service
public class NotificationServiceStub implements NotificationService {

    @Override
    public void notifyReporter(UUID reporterId, String message) {
        // No-op stub — replace with real push/SMS logic later
        System.out.println("[STUB] Notify reporter " + reporterId + ": " + message);
    }

    @Override
    public void notifyVolunteer(UUID volunteerId, String message) {
        // No-op stub
        System.out.println("[STUB] Notify volunteer " + volunteerId + ": " + message);
    }

    @Override
    public void sendIncomingRescueAlert(UUID hospitalOwnerId, UUID sosReportId, String animalCondition) {
        // No-op stub
        System.out.println("[STUB] Rescue alert to hospital owner " + hospitalOwnerId
                + " for SOS " + sosReportId + ": " + animalCondition);
    }
}