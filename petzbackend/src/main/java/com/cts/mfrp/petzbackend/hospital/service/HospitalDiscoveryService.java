
// ─────────────────────────────────────────────
// FILE 20: hospital/service/HospitalDiscoveryService.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.hospital.dto.*;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService.ServiceType;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HospitalDiscoveryService {

    private final HospitalRepository hospitalRepo;

    // US-3.1.1 — Browse all verified hospitals sorted by GPS distance
    @Transactional(readOnly = true)
    public List<HospitalSummaryResponse> getAllHospitals(Double userLat, Double userLon) {
        return hospitalRepo.findByIsVerifiedTrue().stream()
                .map(h -> toSummary(h, userLat, userLon))
                .sorted(Comparator.comparingDouble(HospitalSummaryResponse::getDistanceKm))
                .collect(Collectors.toList());
    }

    // US-3.1.2 — Filter and search hospitals
    @Transactional(readOnly = true)
    public List<HospitalSummaryResponse> filterHospitals(HospitalFilterRequest filter) {
        List<Hospital> hospitals;

        if (filter.getName() != null && !filter.getName().isBlank()) {
            hospitals = hospitalRepo
                    .findByIsVerifiedTrueAndNameContainingIgnoreCase(filter.getName());

        } else if (filter.getServiceType() != null) {
            try {
                ServiceType type = ServiceType.valueOf(
                        filter.getServiceType().toUpperCase());
                hospitals = hospitalRepo.findVerifiedByServiceType(type);
            } catch (IllegalArgumentException e) {
                hospitals = hospitalRepo.findByIsVerifiedTrue();
            }

        } else if (filter.getEmergencyReady() != null && filter.getOpenNow() != null) {
            hospitals = hospitalRepo.findByIsVerifiedTrueAndEmergencyReadyAndIsOpenNow(
                    filter.getEmergencyReady(), filter.getOpenNow());

        } else if (filter.getEmergencyReady() != null) {
            hospitals = hospitalRepo.findByIsVerifiedTrueAndEmergencyReady(
                    filter.getEmergencyReady());

        } else if (filter.getOpenNow() != null) {
            hospitals = hospitalRepo.findByIsVerifiedTrueAndIsOpenNow(
                    filter.getOpenNow());

        } else if (filter.getCity() != null && !filter.getCity().isBlank()) {
            hospitals = hospitalRepo.findByIsVerifiedTrueAndCityIgnoreCase(
                    filter.getCity());

        } else {
            hospitals = hospitalRepo.findByIsVerifiedTrue();
        }

        return hospitals.stream()
                .map(h -> toSummary(h, filter.getUserLatitude(), filter.getUserLongitude()))
                .sorted(Comparator.comparingDouble(HospitalSummaryResponse::getDistanceKm))
                .collect(Collectors.toList());
    }

    // US-3.1.3 — View full hospital profile with doctors and services
    @Transactional(readOnly = true)
    public HospitalProfileResponse getHospitalProfile(
            UUID hospitalId, Double userLat, Double userLon) {

        Hospital h = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Hospital not found: " + hospitalId));

        List<DoctorResponse> doctors = h.getDoctors().stream()
                .filter(d -> d.isActive())
                .map(d -> DoctorResponse.builder()
                        .id(d.getId()).name(d.getName())
                        .specialization(d.getSpecialization())
                        .availability(d.getAvailability())
                        .build())
                .collect(Collectors.toList());

        List<ServiceResponse> services = h.getServices().stream()
                .map(s -> ServiceResponse.builder()
                        .id(s.getId()).serviceName(s.getServiceName())
                        .serviceType(s.getServiceType().name())
                        .price(s.getPrice())
                        .build())
                .collect(Collectors.toList());

        return HospitalProfileResponse.builder()
                .id(h.getId()).name(h.getName())
                .address(h.getAddress()).city(h.getCity())
                .contactPhone(h.getContactPhone())
                .contactEmail(h.getContactEmail())
                .operatingHours(h.getOperatingHours())
                .emergencyReady(h.isEmergencyReady())
                .isOpenNow(h.isOpenNow())
                .isVerified(h.isVerified())
                .distanceKm(calculateDistance(h, userLat, userLon))
                .doctors(doctors).services(services)
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private HospitalSummaryResponse toSummary(Hospital h,
                                              Double userLat, Double userLon) {
        return HospitalSummaryResponse.builder()
                .id(h.getId()).name(h.getName())
                .address(h.getAddress()).city(h.getCity())
                .contactPhone(h.getContactPhone())
                .operatingHours(h.getOperatingHours())
                .emergencyReady(h.isEmergencyReady())
                .isOpenNow(h.isOpenNow()).isVerified(h.isVerified())
                .distanceKm(calculateDistance(h, userLat, userLon))
                .serviceCount(h.getServices().size())
                .build();
    }

    private double calculateDistance(Hospital h, Double lat, Double lon) {
        if (lat == null || lon == null
                || h.getLatitude() == null || h.getLongitude() == null)
            return 0.0;
        return haversineKm(lat, lon,
                h.getLatitude().doubleValue(), h.getLongitude().doubleValue());
    }

    private double haversineKm(double lat1, double lon1,
                               double lat2, double lon2) {
        final double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
