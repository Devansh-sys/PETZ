package com.cts.mfrp.petzbackend.common; // ✅ must match HospitalClient.java package exactly

import com.cts.mfrp.petzbackend.rescue.dto.NearbyHospitalResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * TEMPORARY STUB — delete this once the Hospital module collaborator
 * provides the real @Service implementation of HospitalClient.
 *
 * This only exists so the app can start without the hospital module.
 */
@Service
public class HospitalClientStub implements HospitalClient {

    @Override
    public List<NearbyHospitalResponse> findNearbyEmergencyHospitals(BigDecimal lat, BigDecimal lon) {
        // Returns empty list until hospital module is implemented
        return List.of();
    }

    @Override
    public void sendIncomingRescueAlert(UUID hospitalId, UUID sosReportId, String animalCondition) {
        // No-op stub
    }

    @Override
    public UUID bookEmergencySlot(UUID hospitalId, UUID sosReportId, String slotTime) {
        // Returns a dummy UUID until hospital module is implemented
        return UUID.randomUUID();
    }

    @Override
    public void confirmHandover(UUID hospitalId, UUID sosReportId, UUID bookingId, UUID animalId) {
        // No-op stub
    }
}