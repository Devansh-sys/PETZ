package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalRegistrationRequest;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalResponse;
import com.cts.mfrp.petzbackend.hospital.dto.OperatingHoursDto;
import com.cts.mfrp.petzbackend.hospital.dto.OperatingHoursDto.DailyHours;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalRepository;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalServiceRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Epic 3.2 — Hospital Profile Management (US-3.2.1 and US-3.2.4).
 *
 *   US-3.2.1 — {@link #registerHospital(HospitalRegistrationRequest)}
 *              creates a PENDING hospital and (optionally) its initial
 *              set of services. Platform admins approve via the existing
 *              {@code /admin/hospitals/{id}/verify} endpoint.
 *
 *   US-3.2.4 — {@link #updateOperatingHours} / {@link #updateEmergencyStatus}
 *              update a verified (or pending) hospital's schedule and
 *              emergency readiness. The structured hours JSON is stored
 *              verbatim, and a human-readable summary is computed so
 *              existing read DTOs (HospitalResponse.operatingHours etc.)
 *              stay meaningful.
 */
@Service
@RequiredArgsConstructor
public class HospitalProfileService {

    private static final Logger log = LoggerFactory.getLogger(HospitalProfileService.class);

    private final HospitalRepository        hospitalRepo;
    private final HospitalServiceRepository serviceRepo;
    private final ObjectMapper              objectMapper;

    // ═════════════════════════════════════════════════════════════════
    //  US-3.2.1 — Register hospital (Pending)
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public HospitalResponse registerHospital(HospitalRegistrationRequest req) {
        // AC#3: status = Pending → isVerified stays false until a
        // platform admin approves via /admin/hospitals/{id}/verify.
        Hospital hospital = Hospital.builder()
                .ownerId(req.getOwnerId())
                .name(req.getName())
                .address(req.getAddress())
                .city(req.getCity())
                .contactPhone(req.getContactPhone())
                .contactEmail(req.getContactEmail())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .isVerified(false)                   // AC#3: Pending
                .emergencyReady(Boolean.TRUE.equals(req.getEmergencyReady()))
                .isOpenNow(false)
                .build();

        // AC#1: hours (structured) + human-readable summary
        if (req.getOperatingHours() != null) {
            applyOperatingHours(hospital, req.getOperatingHours());
        } else if (req.getOperatingHoursText() != null) {
            hospital.setOperatingHours(req.getOperatingHoursText());
        }

        Hospital saved = hospitalRepo.save(hospital);

        // AC#1: initial services submitted with the registration form.
        if (req.getServices() != null && !req.getServices().isEmpty()) {
            List<HospitalService> initial = req.getServices().stream()
                    .map(s -> HospitalService.builder()
                            .hospital(saved)
                            .serviceName(s.getServiceName())
                            .serviceType(parseServiceType(s.getServiceType()))
                            .price(s.getPrice())
                            .build())
                    .collect(Collectors.toList());
            serviceRepo.saveAll(initial);
        }

        log.info("Hospital registered: id={} owner={} status=PENDING",
                saved.getId(), saved.getOwnerId());
        return HospitalResponse.from(saved);
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-3.2.4 AC#1 — Update operating hours per day
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public HospitalResponse updateOperatingHours(UUID hospitalId, OperatingHoursDto dto) {
        Hospital h = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", hospitalId));
        applyOperatingHours(h, dto);
        return HospitalResponse.from(hospitalRepo.save(h));
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-3.2.4 AC#2/AC#3 — Toggle emergency readiness
    //  (also surfaces in the discovery directory + rescue module because
    //   both read Hospital.emergencyReady directly).
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public HospitalResponse updateEmergencyStatus(UUID hospitalId, boolean emergencyReady) {
        Hospital h = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", hospitalId));
        h.setEmergencyReady(emergencyReady);
        log.info("Hospital {} emergencyReady -> {}", hospitalId, emergencyReady);
        return HospitalResponse.from(hospitalRepo.save(h));
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private void applyOperatingHours(Hospital h, OperatingHoursDto dto) {
        // Normalize missing days into closed=true so clients get a full week back.
        Map<DayOfWeek, DailyHours> days = dto.getDays() != null
                ? new EnumMap<>(dto.getDays())
                : new EnumMap<>(DayOfWeek.class);

        try {
            h.setOperatingHoursJson(objectMapper.writeValueAsString(
                    OperatingHoursDto.builder().days(days).build()));
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException(
                    "Unable to serialize operating hours: " + ex.getMessage(), ex);
        }
        h.setOperatingHours(summarise(days));
    }

    /**
     * Human-readable summary, e.g. "MON-FRI 09:00-17:00; SAT 10:00-14:00; SUN closed".
     * Best-effort compacting of consecutive days with identical hours.
     */
    static String summarise(Map<DayOfWeek, DailyHours> days) {
        if (days == null || days.isEmpty()) return null;

        StringBuilder sb = new StringBuilder();
        DayOfWeek[] week = DayOfWeek.values();
        int i = 0;
        while (i < week.length) {
            DailyHours d = days.get(week[i]);
            if (d == null) { i++; continue; }

            int j = i;
            while (j + 1 < week.length && equalHours(d, days.get(week[j + 1]))) j++;

            if (sb.length() > 0) sb.append("; ");
            String range = (i == j)
                    ? week[i].name().substring(0, 3)
                    : week[i].name().substring(0, 3) + "-" + week[j].name().substring(0, 3);
            sb.append(range).append(' ')
              .append(d.isClosedSafe() ? "closed"
                      : nz(d.getOpen()) + "-" + nz(d.getClose()));
            i = j + 1;
        }
        return sb.toString();
    }

    private static boolean equalHours(DailyHours a, DailyHours b) {
        if (a == null || b == null) return false;
        if (a.isClosedSafe() != b.isClosedSafe()) return false;
        if (a.isClosedSafe()) return true;
        return java.util.Objects.equals(a.getOpen(), b.getOpen())
                && java.util.Objects.equals(a.getClose(), b.getClose());
    }

    private static String nz(String s) { return s == null ? "?" : s; }

    private HospitalService.ServiceType parseServiceType(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("serviceType is required");
        }
        try {
            return HospitalService.ServiceType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            String allowed = Stream.of(HospitalService.ServiceType.values())
                    .map(Enum::name).collect(Collectors.joining(", "));
            throw new IllegalArgumentException(
                    "Invalid serviceType '" + raw + "'. Allowed: " + allowed);
        }
    }
}
