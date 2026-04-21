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

    // ── Appointment notifications (Epic 3.4) ─────────────────────────
    /**
     * US-3.4.4 — push + in-app confirmation to the pet owner.
     * `details` is a human-readable summary (hospital, doctor, service, date, time, pet).
     */
    void notifyAppointmentConfirmed(UUID userId, UUID appointmentId, String details);

    /**
     * US-3.4.5 AC#4 — hospital staff get an "emergency" banner/push when an
     * emergency appointment is booked (either directly or via rescue flow).
     */
    void notifyHospitalEmergencyBooking(UUID hospitalOwnerId, UUID appointmentId, String details);

    // ── Adoption application notifications (Epic 2.3 + 2.4) ──────────
    /**
     * US-2.3.3 AC#5 + US-2.3.6 — NGO reviewers see the new / withdrawn
     * application in their queue.
     */
    void notifyNgoNewApplication(UUID ngoId, UUID applicationId, String details);

    /**
     * US-2.4.3 / US-2.4.4 — push + in-app notification to the adopter
     * with the final decision (APPROVED / REJECTED / WITHDRAWN).
     */
    void notifyAdopterDecision(UUID adopterId, UUID applicationId,
                               String decision, String reason);

    /**
     * US-2.4.5 — NGO reviewer asked for extra info; adopter sees the
     * clarification questions and can reply by PATCHing form sections.
     */
    void notifyAdopterClarification(UUID adopterId, UUID applicationId, String questions);

    /**
     * US-2.4.6 — adopter informed when a KYC document is verified or
     * rejected (with reason).
     */
    void notifyAdopterKycDecision(UUID adopterId, UUID applicationId, UUID documentId,
                                  String status, String reason);
}
