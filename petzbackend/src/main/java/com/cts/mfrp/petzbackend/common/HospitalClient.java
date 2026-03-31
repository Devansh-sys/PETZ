
// ============================================================
// FILE 1: common/HospitalClient.java
// ============================================================
package com.cts.mfrp.petzbackend.common;

import com.cts.mfrp.petzbackend.rescue.dto.NearbyHospitalResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Shared cross-module interface — defined in common package.
 * Rescue module injects this interface.
 * Hospital module provides the @Service implementation.
 */
public interface HospitalClient {

    /** US-1.5.1 — fetch emergency-ready verified hospitals near SOS location */
    List<NearbyHospitalResponse> findNearbyEmergencyHospitals(BigDecimal lat, BigDecimal lon);

    /** US-1.5.2 — push incoming rescue alert to hospital */
    void sendIncomingRescueAlert(UUID hospitalId, UUID sosReportId, String animalCondition);

    /** US-1.5.3 — create an EMERGENCY booking linked to rescue case; returns new bookingId */
    UUID bookEmergencySlot(UUID hospitalId, UUID sosReportId, String slotTime);

    /** US-1.5.4 — hospital confirms animal receipt */
    void confirmHandover(UUID hospitalId, UUID sosReportId, UUID bookingId, UUID animalId);
}

