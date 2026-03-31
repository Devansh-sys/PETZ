




// ============================================================
// FILE 22: rescue/service/NotificationService.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.service;

import java.util.UUID;

/**
 * Interface — implemented by the notifications collaborator.
 * Rescue module only calls this — never implements it.
 */
public interface NotificationService {

    void notifyReporter(UUID reporterId, String message);

    void notifyVolunteer(UUID volunteerId, String message);

    void sendIncomingRescueAlert(UUID hospitalOwnerId, UUID sosReportId, String animalCondition);
}
