package com.cts.mfrp.petzbackend.common; // ✅ must match HospitalClient.java package exactly

import com.cts.mfrp.petzbackend.rescue.dto.NearbyHospitalResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * TEMPORARY STUB — superseded by
 * {@code com.cts.mfrp.petzbackend.hospital.service.HospitalClientImpl}
 * (which is marked {@code @Primary}).
 *
 * The @Service annotation has been removed so Spring no longer registers
 * this bean. File kept for reference; safe to delete once the real impl
 * is battle-tested.
 */
public class HospitalClientStub implements HospitalClient {

    // Fixed UUIDs so they can be reused across test calls (alert, booking, handover)
    private static final UUID HOSPITAL_1 = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID HOSPITAL_2 = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private static final UUID HOSPITAL_3 = UUID.fromString("00000000-0000-0000-0000-000000000003");

    @Override
    public List<NearbyHospitalResponse> findNearbyEmergencyHospitals(BigDecimal lat, BigDecimal lon) {
        // Returns stub data for dev/testing — replace with real hospital lookup later
        return List.of(
                NearbyHospitalResponse.builder()
                        .hospitalId(HOSPITAL_1).name("Bangalore Pet Hospital")
                        .distanceKm(1.2).services("Surgery, ICU, X-Ray").emergencyReady(true).build(),
                NearbyHospitalResponse.builder()
                        .hospitalId(HOSPITAL_2).name("Compassion Vet Clinic")
                        .distanceKm(2.5).services("General, Emergency").emergencyReady(true).build(),
                NearbyHospitalResponse.builder()
                        .hospitalId(HOSPITAL_3).name("PawCare Animal Centre")
                        .distanceKm(4.0).services("General, Vaccination").emergencyReady(false).build()
        );
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