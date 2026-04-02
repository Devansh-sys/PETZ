package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.common.HospitalClient;
import com.cts.mfrp.petzbackend.common.service.NotificationService;
import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.SosMediaType;
import com.cts.mfrp.petzbackend.rescue.dto.*;
import com.cts.mfrp.petzbackend.rescue.model.*;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment.AssignmentStatus;
import com.cts.mfrp.petzbackend.rescue.model.OnSiteAssessment.AssessmentDecision;
import com.cts.mfrp.petzbackend.rescue.repository.*;
import com.cts.mfrp.petzbackend.sosmedia.model.SosMedia;
import com.cts.mfrp.petzbackend.sosmedia.repository.SosMediaRepository;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import com.cts.mfrp.petzbackend.sosreport.repository.SosReportRepository;
import com.cts.mfrp.petzbackend.statuslog.model.StatusLog;
import com.cts.mfrp.petzbackend.statuslog.repository.StatusLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OnSiteRescueService {

    private static final double ARRIVAL_RADIUS_KM = 0.2; // 200 m

    private final SosReportRepository        sosRepo;
    private final NgoAssignmentRepository    assignmentRepo;
    private final OnSiteAssessmentRepository assessmentRepo;
    private final SosMediaRepository         mediaRepo;
    private final StatusLogRepository        logRepo;
    private final HospitalClient             hospitalClient;
    private final NotificationService        notificationService;

    // ── US-1.4.1: Mark Arrival ────────────────────────────────────────
    @Transactional
    public void markArrival(UUID sosReportId, ArrivalRequest req) {
        SosReport report = fetchReport(sosReportId);

        double dist = haversineKm(
                report.getLatitude(), report.getLongitude(),
                req.getCurrentLatitude(), req.getCurrentLongitude()
        );
        if (dist > ARRIVAL_RADIUS_KM) {
            throw new IllegalStateException(
                    "Volunteer must be within 200 m of rescue location (current: "
                            + String.format("%.0f", dist * 1000) + " m away)");
        }

        NgoAssignment assignment = assignmentRepo
                .findBySosReportIdAndVolunteerId(sosReportId, req.getVolunteerId())
                .orElseThrow(() -> new NoSuchElementException("No active assignment found"));

        assignment.setArrivalAt(LocalDateTime.now());
        assignment.setAssignmentStatus(AssignmentStatus.ARRIVED);
        assignmentRepo.save(assignment);

        updateStatus(report, ReportStatus.ON_SITE);

        // AC4: notify reporter
        notificationService.notifyReporter(report.getReporter().getId(),
                "Help has arrived at the rescue location.");
    }

    // ── US-1.4.2 + US-1.4.3: On-Site Assessment + Decision ──────────
    @Transactional
    public OnSiteAssessmentResponse submitAssessment(UUID sosReportId, OnSiteAssessmentRequest req) {
        SosReport report = fetchReport(sosReportId);

        if (assessmentRepo.findBySosReportId(sosReportId).isPresent()) {
            throw new IllegalStateException("Assessment already submitted for this SOS report");
        }

        OnSiteAssessment assessment = OnSiteAssessment.builder()
                .sosReportId(sosReportId)
                .volunteerId(req.getVolunteerId())
                .animalCondition(req.getAnimalCondition())
                .injuryDescription(req.getInjuryDescription())
                .decision(req.getDecision())
                .decisionJustification(req.getDecisionJustification())
                .assessedAt(LocalDateTime.now())
                .build();
        assessmentRepo.save(assessment);

        String nextStep;
        if (req.getDecision() == AssessmentDecision.TRANSPORT_TO_HOSPITAL) {
            updateStatus(report, ReportStatus.TRANSPORTING);
            nextStep = "HOSPITAL_SELECTION";
        } else if (req.getDecision() == AssessmentDecision.RELEASE) {
            updateStatus(report, ReportStatus.COMPLETE);
            nextStep = "RELEASE_CONFIRMATION";
        } else {
            updateStatus(report, ReportStatus.COMPLETE);
            nextStep = "CANNOT_LOCATE";
        }

        return OnSiteAssessmentResponse.builder()
                .assessmentId(assessment.getId())
                .sosReportId(sosReportId)
                .decision(assessment.getDecision())
                .animalCondition(assessment.getAnimalCondition())
                .assessedAt(assessment.getAssessedAt())
                .nextStep(nextStep)
                .build();
    }

    // ── US-1.5.1: Nearby Emergency-Ready Hospitals ───────────────────
    public List<NearbyHospitalResponse> getNearbyEmergencyHospitals(UUID sosReportId) {
        SosReport report = fetchReport(sosReportId);
        return hospitalClient.findNearbyEmergencyHospitals(
                report.getLatitude(), report.getLongitude());
    }

    // ── US-1.5.2: Send Incoming Rescue Alert ─────────────────────────
    @Transactional
    public void sendIncomingRescueAlert(UUID sosReportId, UUID hospitalId) {
        OnSiteAssessment assessment = assessmentRepo.findBySosReportId(sosReportId)
                .orElseThrow(() -> new NoSuchElementException(
                        "Assessment not found for SOS: " + sosReportId));

        hospitalClient.sendIncomingRescueAlert(
                hospitalId, sosReportId, assessment.getAnimalCondition());
    }

    // ── US-1.5.3: Book Emergency Slot ────────────────────────────────
    @Transactional
    public EmergencyBookingResponse bookEmergencySlot(UUID sosReportId, EmergencyBookingRequest req) {
        fetchReport(sosReportId);

        UUID bookingId = hospitalClient.bookEmergencySlot(
                req.getHospitalId(), sosReportId, req.getSlotTime());

        return EmergencyBookingResponse.builder()
                .bookingId(bookingId)
                .sosReportId(sosReportId)
                .hospitalId(req.getHospitalId())
                .slotTime(req.getSlotTime())
                .status("CONFIRMED")
                .build();
    }

    // ── US-1.5.4: Record Hospital Handover ───────────────────────────
    @Transactional
    public HandoverResponse recordHandover(UUID sosReportId, HandoverRequest req) {
        SosReport report = fetchReport(sosReportId);

        hospitalClient.confirmHandover(
                req.getHospitalId(), sosReportId, req.getBookingId(), req.getAnimalId());

        updateStatus(report, ReportStatus.COMPLETE);

        assignmentRepo
                .findBySosReportIdAndAssignmentStatus(sosReportId, AssignmentStatus.ARRIVED)
                .ifPresent(a -> notificationService.notifyVolunteer(a.getVolunteerId(),
                        "Hospital confirmed animal receipt for rescue case " + sosReportId));

        return HandoverResponse.builder()
                .sosReportId(sosReportId)
                .hospitalId(req.getHospitalId())
                .handoverAt(LocalDateTime.now())
                .rescueStatus(ReportStatus.COMPLETE.name())
                .build();
    }

    // ── US-1.5.5: Confirm Release with Photo ─────────────────────────
    @Transactional
    public void confirmRelease(UUID sosReportId, ReleaseConfirmationRequest req) {
        SosReport report = fetchReport(sosReportId);

        SosMedia photo = new SosMedia();
        photo.setSosReport(report);
        photo.setFileUrl(req.getReleasePhotoUrl());
        photo.setMediaType(SosMediaType.PHOTO);
        mediaRepo.save(photo);

        updateStatus(report, ReportStatus.COMPLETE);
    }

    // ─────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────

    private SosReport fetchReport(UUID id) {
        return sosRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("SOS Report not found: " + id));
    }

    private void updateStatus(SosReport report, ReportStatus newStatus) {
        report.setCurrentStatus(newStatus);
        sosRepo.save(report);

        StatusLog log = new StatusLog();
        log.setSosReport(report);
        log.setStatus(newStatus.name());
        logRepo.save(log);
    }

    /** Haversine formula — distance in km */
    private double haversineKm(BigDecimal lat1, BigDecimal lon1,
                               BigDecimal lat2, BigDecimal lon2) {
        final double R = 6371;
        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1.doubleValue()))
                * Math.cos(Math.toRadians(lat2.doubleValue()))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}