package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;
import com.cts.mfrp.petzbackend.rescue.dto.AdminRescueMapResponse;
import com.cts.mfrp.petzbackend.rescue.dto.ReassignRequest;
import com.cts.mfrp.petzbackend.rescue.dto.ReassignResponse;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment.AssignmentStatus;
import com.cts.mfrp.petzbackend.rescue.repository.NgoAssignmentRepository;
import com.cts.mfrp.petzbackend.rescue.repository.SosReportRescueRepository;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminRescueService {

    private final SosReportRescueRepository sosReportRepo;
    private final NgoAssignmentRepository   ngoAssignmentRepo;

    // ── US-1.8.1 ─────────────────────────────────────────────────────────────

    /**
     * Returns all non-completed SOS reports enriched with assignment info,
     * with optional in-memory filtering by status, severity, and NGO.
     */
    public List<AdminRescueMapResponse> getAllActiveRescues(
            ReportStatus statusFilter,
            UrgencyLevel severityFilter,
            UUID ngoFilter) {

        return sosReportRepo.findByCurrentStatusNot(ReportStatus.COMPLETE)
                .stream()
                .filter(r -> statusFilter  == null || r.getCurrentStatus() == statusFilter)
                .filter(r -> severityFilter == null || r.getUrgencyLevel() == severityFilter)
                .map(r -> enrichWithAssignment(r, ngoFilter))
                .filter(r -> r != null)
                .collect(Collectors.toList());
    }

    private AdminRescueMapResponse enrichWithAssignment(SosReport r, UUID ngoFilter) {
        List<NgoAssignment> assignments = ngoAssignmentRepo.findBySosReport_Id(r.getId());

        NgoAssignment active = assignments.stream()
                .filter(a -> a.getAssignmentStatus() == AssignmentStatus.ACCEPTED
                        || a.getAssignmentStatus() == AssignmentStatus.ARRIVED)
                .findFirst()
                .orElse(null);

        // If an NGO filter is set, exclude reports not assigned to that NGO
        if (ngoFilter != null) {
            if (active == null || !ngoFilter.equals(active.getNgoId())) return null;
        }

        return AdminRescueMapResponse.builder()
                .sosId(r.getId())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .status(r.getCurrentStatus())
                .urgencyLevel(r.getUrgencyLevel())
                .reporterPhone(r.getReporter().getPhone())
                .reportedAt(r.getReportedAt())
                .assignedNgoId(active != null ? active.getNgoId().toString() : "Unassigned")
                .assignedVolunteerId(active != null && active.getVolunteerId() != null
                        ? active.getVolunteerId().toString() : "—")
                .build();
    }

    // ── US-1.8.2 ─────────────────────────────────────────────────────────────

    /**
     * Marks the current active assignment REASSIGNED (with audit trail),
     * then creates a fresh PENDING assignment for the new NGO rep.
     */
    @Transactional
    public ReassignResponse reassignRescue(UUID sosReportId,
                                           ReassignRequest req,
                                           UUID adminId) {

        SosReport report = sosReportRepo.findById(sosReportId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "SOS report not found: " + sosReportId));

        if (report.getCurrentStatus() == ReportStatus.COMPLETE) {
            throw new IllegalStateException("Cannot reassign a completed rescue.");
        }

        // Archive existing active assignment
        ngoAssignmentRepo.findBySosReport_IdAndAssignmentStatusIn(
                sosReportId,
                List.of(AssignmentStatus.PENDING,
                        AssignmentStatus.ACCEPTED,
                        AssignmentStatus.ARRIVED)
        ).ifPresent(existing -> {
            existing.setAssignmentStatus(AssignmentStatus.REASSIGNED);
            existing.setReassignmentReason(req.getReason());
            existing.setReassignedBy(adminId);
            existing.setReassignedAt(LocalDateTime.now());
            ngoAssignmentRepo.save(existing);
        });

        // Create new assignment for the selected NGO rep
        NgoAssignment newAssignment = NgoAssignment.builder()
                .sosReport(report)
                .ngoId(req.getNewNgoId())
                .volunteerId(req.getNewVolunteerId())
                .assignmentStatus(AssignmentStatus.PENDING)
                .build();

        NgoAssignment saved = ngoAssignmentRepo.save(newAssignment);

        // TODO: fire NotificationService.pushDispatch(req.getNewVolunteerId(), sosReportId)

        return ReassignResponse.builder()
                .assignmentId(saved.getId())
                .sosReportId(sosReportId)
                .newNgoId(req.getNewNgoId())
                .newVolunteerId(req.getNewVolunteerId())
                .reason(req.getReason())
                .reassignedAt(saved.getReassignedAt())
                .build();
    }
}