package com.cts.mfrp.petzbackend.common.service;

import com.cts.mfrp.petzbackend.ngo.model.Ngo;

import java.util.UUID;

public interface NotificationService {

    void sendSirenAlert(Ngo ngo, double sosLat, double sosLon);
    void notifyOthersMissionClaimed(UUID missionId, UUID ngoId);
    void notifyReporter(UUID reporterId, String message);
    void notifyVolunteer(UUID volunteerId, String message);
    void sendIncomingRescueAlert(UUID hospitalOwnerId, UUID sosReportId, String animalCondition);
    void notifyAppointmentConfirmed(UUID userId, UUID appointmentId, String details);
    void notifyHospitalEmergencyBooking(UUID hospitalOwnerId, UUID appointmentId, String details);
    void notifyNgoNewApplication(UUID ngoId, UUID applicationId, String details);
    void notifyAdopterDecision(UUID adopterId, UUID applicationId, String decision, String reason);
    void notifyAdopterClarification(UUID adopterId, UUID applicationId, String questions);
    void notifyAdopterKycDecision(UUID adopterId, UUID applicationId, UUID documentId, String status, String reason);
    void notifyAdopterHandoverScheduled(UUID adopterId, UUID adoptionId, String details);
    void notifyNgoHandoverScheduled(UUID ngoId, UUID adoptionId, String details);
    void notifyHospitalModuleLinked(UUID adopterId, UUID adoptionId, UUID hospitalPetId);
    void notifyAdopterFollowUpDue(UUID adopterId, UUID followUpId, String details);
    void notifyNgoFollowUpDue(UUID ngoId, UUID followUpId, String details);
    void notifyDisputeResolved(UUID userId, UUID disputeId, String action, String resolution);
}
