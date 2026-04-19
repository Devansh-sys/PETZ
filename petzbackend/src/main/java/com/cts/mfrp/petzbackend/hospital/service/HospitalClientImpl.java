package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.HospitalClient;
import com.cts.mfrp.petzbackend.common.service.NotificationService;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentBookingDtos.AppointmentBookingResponse;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalRepository;
import com.cts.mfrp.petzbackend.rescue.dto.NearbyHospitalResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Real implementation of {@link HospitalClient} backed by the hospital
 * module's repositories + {@link AppointmentBookingService}.
 *
 * Marked {@code @Primary} so Spring injects this in preference to
 * {@link com.cts.mfrp.petzbackend.common.HospitalClientStub}. The stub is
 * left in place as a fallback; its @Service has been removed.
 *
 * Wires rescue → real appointment persistence (US-3.4.5 AC#3 "Triggerable
 * from rescue module").
 */
@Service
@Primary
@RequiredArgsConstructor
public class HospitalClientImpl implements HospitalClient {

    private static final Logger log = LoggerFactory.getLogger(HospitalClientImpl.class);

    private final HospitalRepository         hospitalRepo;
    private final AppointmentBookingService  bookingService;
    private final NotificationService        notificationService;

    @Override
    public List<NearbyHospitalResponse> findNearbyEmergencyHospitals(BigDecimal lat, BigDecimal lon) {
        // Simple filter: verified + emergency-ready. Distance computed
        // via haversine when coords are present on the hospital row.
        return hospitalRepo.findAll().stream()
                .filter(Hospital::isEmergencyReady)
                .filter(Hospital::isVerified)
                .map(h -> NearbyHospitalResponse.builder()
                        .hospitalId(h.getId())
                        .name(h.getName())
                        .distanceKm(distanceKm(lat, lon, h.getLatitude(), h.getLongitude()))
                        .services(summariseServices(h))
                        .emergencyReady(h.isEmergencyReady())
                        .build())
                .sorted(Comparator.comparingDouble(NearbyHospitalResponse::getDistanceKm))
                .collect(Collectors.toList());
    }

    @Override
    public void sendIncomingRescueAlert(UUID hospitalId, UUID sosReportId, String animalCondition) {
        hospitalRepo.findById(hospitalId).ifPresent(h ->
                notificationService.sendIncomingRescueAlert(
                        h.getOwnerId(), sosReportId, animalCondition));
    }

    @Override
    public UUID bookEmergencySlot(UUID hospitalId, UUID sosReportId, String slotTime) {
        LocalDateTime when = parseSlotTime(slotTime);
        LocalDate date = when.toLocalDate();
        LocalTime time = when.toLocalTime();

        // petId/userId are unknown at the rescue-booking step — the slot is
        // held in the animal's name. Leave petId null; the handover step
        // will associate the rescued animal later.
        AppointmentBookingResponse resp = bookingService.bookEmergencySlot(
                hospitalId,
                /* userId       */ null,
                /* petId        */ null,
                date,
                time,
                sosReportId,
                /* animalCondition */ null);

        log.info("Emergency slot {} booked via rescue flow (SOS {})",
                resp.getAppointmentId(), sosReportId);
        return resp.getAppointmentId();
    }

    @Override
    public void confirmHandover(UUID hospitalId, UUID sosReportId, UUID bookingId, UUID animalId) {
        // Intentionally lightweight for now — the rescue service already
        // updates SOS status and notifies the volunteer. Hook point left
        // for a future MedicalRecord creation tied to this bookingId.
        log.info("Handover confirmed: hospital={} sos={} booking={} animal={}",
                hospitalId, sosReportId, bookingId, animalId);
    }

    // ── helpers ─────────────────────────────────────────────────────

    private static LocalDateTime parseSlotTime(String slotTime) {
        if (slotTime == null || slotTime.isBlank()) return LocalDateTime.now();
        try {
            return LocalDateTime.parse(slotTime);
        } catch (Exception ignored) {
            try {
                return OffsetDateTime.parse(slotTime,
                        DateTimeFormatter.ISO_OFFSET_DATE_TIME).toLocalDateTime();
            } catch (Exception ignored2) {
                return LocalDateTime.now();
            }
        }
    }

    private static double distanceKm(BigDecimal sosLat, BigDecimal sosLon,
                                     BigDecimal hospLat, BigDecimal hospLon) {
        if (sosLat == null || sosLon == null || hospLat == null || hospLon == null) return 0.0;
        final double R = 6371;
        double dLat = Math.toRadians(hospLat.doubleValue() - sosLat.doubleValue());
        double dLon = Math.toRadians(hospLon.doubleValue() - sosLon.doubleValue());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(sosLat.doubleValue()))
                * Math.cos(Math.toRadians(hospLat.doubleValue()))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private static String summariseServices(Hospital h) {
        if (h.getServices() == null || h.getServices().isEmpty()) return "";
        return h.getServices().stream()
                .map(HospitalService::getServiceName)
                .collect(Collectors.joining(", "));
    }
}
