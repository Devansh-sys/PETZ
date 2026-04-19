package com.cts.mfrp.petzbackend.common.service;

import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * TEMPORARY STUB — delete once a real Notifications module is available.
 * Logs all notifications to console instead of sending real alerts.
 */
@Service
public class NotificationServiceStub implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceStub.class);

    // ── NGO notifications ────────────────────────────────────────

    @Override
    public void sendSirenAlert(Ngo ngo, double sosLat, double sosLon) {
        log.info("[STUB] SIREN ALERT → NGO '{}' notified for rescue at [{}, {}]",
                ngo.getName(), sosLat, sosLon);
    }

    @Override
    public void notifyOthersMissionClaimed(UUID missionId, UUID ngoId) {
        log.info("[STUB] Mission {} claimed by NGO {}. Other NGOs notified.", missionId, ngoId);
    }

    // ── Rescue workflow notifications ────────────────────────────

    @Override
    public void notifyReporter(UUID reporterId, String message) {
        log.info("[STUB] Notify reporter {}: {}", reporterId, message);
    }

    @Override
    public void notifyVolunteer(UUID volunteerId, String message) {
        log.info("[STUB] Notify volunteer {}: {}", volunteerId, message);
    }

    @Override
    public void sendIncomingRescueAlert(UUID hospitalOwnerId, UUID sosReportId, String animalCondition) {
        log.info("[STUB] Rescue alert to hospital owner {} for SOS {}: {}",
                hospitalOwnerId, sosReportId, animalCondition);
    }

    // ── Appointment notifications (Epic 3.4) ─────────────────────────

    @Override
    public void notifyAppointmentConfirmed(UUID userId, UUID appointmentId, String details) {
        log.info("═══════════════════════════════════════════");
        log.info("  [STUB] APPOINTMENT CONFIRMED → user {}", userId);
        log.info("  appointmentId: {}", appointmentId);
        log.info("  {}", details);
        log.info("═══════════════════════════════════════════");
    }

    @Override
    public void notifyHospitalEmergencyBooking(UUID hospitalOwnerId, UUID appointmentId, String details) {
        log.info("[STUB] 🚨 EMERGENCY BOOKING → hospital owner {} | appt {} | {}",
                hospitalOwnerId, appointmentId, details);
    }
}
