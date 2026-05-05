package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import com.cts.mfrp.petzbackend.rescue.dto.AdminRescueMapResponse;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment.AssignmentStatus;
import com.cts.mfrp.petzbackend.rescue.repository.NgoAssignmentRepository;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import com.cts.mfrp.petzbackend.sosreport.repository.SosReportRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminRescueService {

    private final SosReportRepository      sosReportRepo;
    private final NgoAssignmentRepository  ngoAssignmentRepo;
    private final NgoRepository            ngoRepo;

    // ── US-1.8.1 ─────────────────────────────────────────────────────────────

    /**
     * Returns all non-completed SOS reports enriched with assignment info.
     * The auto-queue system handles NGO assignment — admin only monitors here.
     */
    @Transactional(readOnly = true)
    public List<AdminRescueMapResponse> getAllActiveRescues(
            ReportStatus statusFilter,
            UrgencyLevel severityFilter,
            UUID ngoFilter) {

        return sosReportRepo.findByCurrentStatusNot(ReportStatus.COMPLETE)
                .stream()
                .filter(r -> statusFilter   == null || r.getCurrentStatus() == statusFilter)
                .filter(r -> severityFilter == null || r.getUrgencyLevel()  == severityFilter)
                .map(r -> enrichWithAssignment(r, ngoFilter))
                .filter(r -> r != null)
                .collect(Collectors.toList());
    }

    private AdminRescueMapResponse enrichWithAssignment(SosReport r, UUID ngoFilter) {
        List<NgoAssignment> assignments = ngoAssignmentRepo.findBySosReport_Id(r.getId());

        // Show ACCEPTED/ARRIVED first (NGO actively working), then PENDING (waiting for response)
        NgoAssignment active = assignments.stream()
                .filter(a -> a.getAssignmentStatus() == AssignmentStatus.ACCEPTED
                          || a.getAssignmentStatus() == AssignmentStatus.ARRIVED)
                .findFirst()
                .orElseGet(() -> assignments.stream()
                        .filter(a -> a.getAssignmentStatus() == AssignmentStatus.PENDING)
                        .findFirst()
                        .orElse(null));

        if (ngoFilter != null) {
            if (active == null || !ngoFilter.equals(active.getNgoId())) return null;
        }

        // Resolve NGO name for display
        String assignedNgoName = null;
        if (active != null && active.getNgoId() != null) {
            assignedNgoName = ngoRepo.findById(active.getNgoId())
                    .map(Ngo::getName)
                    .orElse(null);
        }

        // Safely resolve reporter phone
        String reporterPhone = null;
        try {
            if (r.getReporter() != null) reporterPhone = r.getReporter().getPhone();
        } catch (EntityNotFoundException e) {
            log.warn("Reporter not found for SOS report {}", r.getId());
        }

        return AdminRescueMapResponse.builder()
                .sosId(r.getId())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .status(r.getCurrentStatus())
                .urgencyLevel(r.getUrgencyLevel())
                .reporterPhone(reporterPhone)
                .reportedAt(r.getReportedAt())
                .assignedNgoId(active != null ? active.getNgoId().toString() : null)
                .assignedNgoName(assignedNgoName)
                .assignedVolunteerId(active != null && active.getVolunteerId() != null
                        ? active.getVolunteerId().toString() : null)
                .build();
    }
}
