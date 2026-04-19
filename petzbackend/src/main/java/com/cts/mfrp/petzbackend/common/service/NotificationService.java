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
}
