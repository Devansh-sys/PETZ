package com.cts.mfrp.petzbackend.common.service;

import com.cts.mfrp.petzbackend.ngo.model.Ngo;
<<<<<<< Updated upstream
import com.cts.mfrp.petzbackend.notification.enums.NotificationType;
import com.cts.mfrp.petzbackend.notification.service.InAppNotificationService;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
=======
>>>>>>> Stashed changes
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

<<<<<<< Updated upstream
import java.util.List;
import java.util.UUID;

/**
 * US-4.2.1 — upgraded notification stub.
 *
 * Previously: log-only.
 * Now: log PLUS persist an in-app {@code Notification} row so the user
 * actually sees it in their inbox at GET /api/v1/users/me/notifications.
 *
 * For NGO-targeted events we look up all NGO_REP users of that NGO
 * and fan-out one row per user.  If the lookup returns empty we just log.
 *
 * Replace this stub with a real push-notification adapter (FCM, OneSignal)
 * before production — the {@link NotificationService} interface stays stable.
 */
@Service
@RequiredArgsConstructor
=======
import java.util.UUID;

/**
 * TEMPORARY STUB — delete once a real Notifications module is available.
 * Logs all notifications to console instead of sending real alerts.
 */
@Service
>>>>>>> Stashed changes
public class NotificationServiceStub implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceStub.class);

<<<<<<< Updated upstream
    private final InAppNotificationService inApp;
    private final UserRepository           userRepo;

    // ── NGO notifications ────────────────────────────────────────────────

    @Override
    public void sendSirenAlert(Ngo ngo, double sosLat, double sosLon) {
        log.info("[STUB] SIREN ALERT → NGO '{}' at [{}, {}]", ngo.getName(), sosLat, sosLon);
        // Ngo entity doesn't carry a userId directly; fan-out to NGO_REP users.
        fanOutToNgo(ngo.getId(),
                NotificationType.SOS_ALERT,
                "🚨 SOS Alert Nearby",
                "A rescue case was reported near [" + sosLat + ", " + sosLon + "]. Respond now.",
                ngo.getId(), "NGO");
=======
    // ── NGO notifications ────────────────────────────────────────

    @Override
    public void sendSirenAlert(Ngo ngo, double sosLat, double sosLon) {
        log.info("[STUB] SIREN ALERT → NGO '{}' notified for rescue at [{}, {}]",
                ngo.getName(), sosLat, sosLon);
>>>>>>> Stashed changes
    }

    @Override
    public void notifyOthersMissionClaimed(UUID missionId, UUID ngoId) {
<<<<<<< Updated upstream
        log.info("[STUB] Mission {} claimed by NGO {}.", missionId, ngoId);
        fanOutToNgo(ngoId,
                NotificationType.MISSION_CLAIMED,
                "Mission Claimed",
                "Rescue mission " + missionId + " has been claimed.",
                missionId, "MISSION");
    }

    // ── Rescue workflow ──────────────────────────────────────────────────
=======
        log.info("[STUB] Mission {} claimed by NGO {}. Other NGOs notified.", missionId, ngoId);
    }

    // ── Rescue workflow notifications ────────────────────────────
>>>>>>> Stashed changes

    @Override
    public void notifyReporter(UUID reporterId, String message) {
        log.info("[STUB] Notify reporter {}: {}", reporterId, message);
<<<<<<< Updated upstream
        inApp.create(reporterId, NotificationType.RESCUE_UPDATE,
                "Rescue Update", message);
=======
>>>>>>> Stashed changes
    }

    @Override
    public void notifyVolunteer(UUID volunteerId, String message) {
        log.info("[STUB] Notify volunteer {}: {}", volunteerId, message);
<<<<<<< Updated upstream
        inApp.create(volunteerId, NotificationType.RESCUE_UPDATE,
                "Mission Update", message);
    }

    @Override
    public void sendIncomingRescueAlert(UUID hospitalOwnerId, UUID sosReportId,
                                        String animalCondition) {
        log.info("[STUB] Rescue alert to hospital owner {} for SOS {}: {}",
                hospitalOwnerId, sosReportId, animalCondition);
        inApp.create(hospitalOwnerId, NotificationType.RESCUE_UPDATE,
                "Incoming Rescue Animal",
                "Condition: " + animalCondition + ". SOS report: " + sosReportId,
                sosReportId, "SOS_REPORT");
    }

    // ── Appointment notifications (Epic 3.4) ─────────────────────────────

    @Override
    public void notifyAppointmentConfirmed(UUID userId, UUID appointmentId, String details) {
        log.info("[STUB] APPOINTMENT CONFIRMED → user {} | appt {}", userId, appointmentId);
        inApp.create(userId, NotificationType.APPOINTMENT_CONFIRMED,
                "Appointment Confirmed ✓",
                details, appointmentId, "APPOINTMENT");
    }

    @Override
    public void notifyHospitalEmergencyBooking(UUID hospitalOwnerId, UUID appointmentId,
                                               String details) {
        log.info("[STUB] EMERGENCY BOOKING → hospital owner {} | appt {}", hospitalOwnerId, appointmentId);
        inApp.create(hospitalOwnerId, NotificationType.APPOINTMENT_EMERGENCY,
                "🚨 Emergency Appointment",
                details, appointmentId, "APPOINTMENT");
    }

    // ── Adoption application notifications (Epic 2.3 + 2.4) ─────────────

    @Override
    public void notifyNgoNewApplication(UUID ngoId, UUID applicationId, String details) {
        log.info("[STUB] NGO {} has new adoption application {}", ngoId, applicationId);
        fanOutToNgo(ngoId,
                NotificationType.ADOPTION_APPLICATION,
                "New Adoption Application",
                details, applicationId, "APPLICATION");
=======
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

    // ── Adoption application notifications (Epic 2.3 + 2.4) ──────────

    @Override
    public void notifyNgoNewApplication(UUID ngoId, UUID applicationId, String details) {
        log.info("[STUB] 📬 NGO {} has new adoption application {} | {}",
                ngoId, applicationId, details);
>>>>>>> Stashed changes
    }

    @Override
    public void notifyAdopterDecision(UUID adopterId, UUID applicationId,
                                      String decision, String reason) {
<<<<<<< Updated upstream
        log.info("[STUB] ADOPTION DECISION → adopter {} | app {} | {}", adopterId, applicationId, decision);
        String body = "Your adoption application has been " + decision.toLowerCase() + ".";
        if (reason != null && !reason.isBlank()) body += " Reason: " + reason;
        inApp.create(adopterId, NotificationType.ADOPTION_DECISION,
                "Adoption Application " + capitalize(decision),
                body, applicationId, "APPLICATION");
=======
        log.info("═══════════════════════════════════════════");
        log.info("  [STUB] ADOPTION DECISION → adopter {}", adopterId);
        log.info("  applicationId: {}  decision: {}", applicationId, decision);
        if (reason != null) log.info("  reason: {}", reason);
        log.info("═══════════════════════════════════════════");
>>>>>>> Stashed changes
    }

    @Override
    public void notifyAdopterClarification(UUID adopterId, UUID applicationId, String questions) {
<<<<<<< Updated upstream
        log.info("[STUB] CLARIFICATION REQUESTED → adopter {} | app {}", adopterId, applicationId);
        inApp.create(adopterId, NotificationType.ADOPTION_CLARIFICATION,
                "Clarification Needed",
                "The NGO has questions about your application: " + questions,
                applicationId, "APPLICATION");
    }

    @Override
    public void notifyAdopterKycDecision(UUID adopterId, UUID applicationId,
                                         UUID documentId, String status, String reason) {
        log.info("[STUB] KYC doc {} → {} (adopter {})", documentId, status, adopterId);
        String body = "Your KYC document has been " + status.toLowerCase() + ".";
        if (reason != null && !reason.isBlank()) body += " Reason: " + reason;
        inApp.create(adopterId, NotificationType.ADOPTION_KYC,
                "KYC Document " + capitalize(status),
                body, documentId, "KYC_DOCUMENT");
    }

    // ── Adoption completion + admin (Epic 2.5 + 2.6) ─────────────────────

    @Override
    public void notifyAdopterHandoverScheduled(UUID adopterId, UUID adoptionId, String details) {
        log.info("[STUB] HANDOVER SCHEDULED → adopter {} | adoption {}", adopterId, adoptionId);
        inApp.create(adopterId, NotificationType.ADOPTION_HANDOVER,
                "Handover Date Scheduled 📅",
                details, adoptionId, "ADOPTION");
    }

    @Override
    public void notifyNgoHandoverScheduled(UUID ngoId, UUID adoptionId, String details) {
        log.info("[STUB] HANDOVER SCHEDULED → NGO {} | adoption {}", ngoId, adoptionId);
        fanOutToNgo(ngoId,
                NotificationType.ADOPTION_HANDOVER,
                "Handover Scheduled",
                details, adoptionId, "ADOPTION");
    }

    @Override
    public void notifyHospitalModuleLinked(UUID adopterId, UUID adoptionId, UUID hospitalPetId) {
        log.info("[STUB] PET LINKED → adopter {} | adoption {} | pet {}", adopterId, adoptionId, hospitalPetId);
        inApp.create(adopterId, NotificationType.HOSPITAL_MODULE_LINKED,
                "Your Pet is Ready for Vet Appointments 🐾",
                "Your adopted pet (id: " + hospitalPetId + ") is now in the hospital module. "
                        + "You can book vet appointments right away.",
                hospitalPetId, "PET");
    }

    @Override
    public void notifyAdopterFollowUpDue(UUID adopterId, UUID followUpId, String details) {
        log.info("[STUB] FOLLOW-UP DUE → adopter {} | followUp {}", adopterId, followUpId);
        inApp.create(adopterId, NotificationType.ADOPTION_FOLLOW_UP,
                "Follow-Up Reminder 🔔",
                details, followUpId, "FOLLOW_UP");
    }

    @Override
    public void notifyNgoFollowUpDue(UUID ngoId, UUID followUpId, String details) {
        log.info("[STUB] FOLLOW-UP DUE → NGO {} | followUp {}", ngoId, followUpId);
        fanOutToNgo(ngoId,
                NotificationType.ADOPTION_FOLLOW_UP,
                "Follow-Up Due",
                details, followUpId, "FOLLOW_UP");
    }

    @Override
    public void notifyDisputeResolved(UUID userId, UUID disputeId, String action, String resolution) {
        log.info("[STUB] DISPUTE RESOLVED → user {} | dispute {} | {}", userId, disputeId, action);
        inApp.create(userId, NotificationType.DISPUTE_RESOLVED,
                "Dispute Resolved — " + capitalize(action),
                resolution, disputeId, "DISPUTE");
    }

    // ─── helpers ──────────────────────────────────────────────────────────

    /**
     * Fan-out: create one Notification row for every NGO_REP user belonging
     * to the given ngoId. Falls back to a plain log if no users are found.
     */
    private void fanOutToNgo(UUID ngoId, NotificationType type,
                             String title, String body,
                             UUID referenceId, String referenceType) {
        if (ngoId == null) return;
        List<User> ngoUsers = userRepo.findByNgoId(ngoId);
        if (ngoUsers.isEmpty()) {
            log.debug("[STUB] fanOut: no users found for ngoId={}", ngoId);
            return;
        }
        for (User u : ngoUsers) {
            inApp.create(u.getId(), type, title, body, referenceId, referenceType);
        }
    }

    private static String capitalize(String s) {
        if (s == null || s.isBlank()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
=======
        log.info("[STUB] ❓ CLARIFICATION REQUESTED → adopter {} | app {} | questions: {}",
                adopterId, applicationId, questions);
    }

    @Override
    public void notifyAdopterKycDecision(UUID adopterId, UUID applicationId, UUID documentId,
                                         String status, String reason) {
        log.info("[STUB] KYC doc {} on app {} -> {} (adopter {})  reason={}",
                documentId, applicationId, status, adopterId, reason);
>>>>>>> Stashed changes
    }
}
