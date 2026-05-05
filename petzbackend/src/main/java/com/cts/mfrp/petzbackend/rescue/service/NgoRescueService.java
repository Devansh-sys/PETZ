package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.rescue.dto.NgoAssignmentResponse;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment.AssignmentStatus;
import com.cts.mfrp.petzbackend.rescue.repository.NgoAssignmentRepository;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import com.cts.mfrp.petzbackend.sosreport.repository.SosReportRepository;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NgoRescueService {

    private final NgoAssignmentRepository assignmentRepo;
    private final SosReportRepository     sosReportRepo;
    private final UserRepository          userRepo;
    private final RescueQueueService      rescueQueueService;

    // ── All REPORTED (open) rescues any NGO can see ──────────────────────────

    @Transactional(readOnly = true)
    public List<NgoAssignmentResponse> getOpenReports() {
        return sosReportRepo
                .findByCurrentStatusOrderByReportedAtDesc(ReportStatus.REPORTED)
                .stream()
                .map(this::toOpenResponse)
                .collect(Collectors.toList());
    }

    // ── NGO self-accepts an open rescue (creates assignment + ACCEPTED) ──────

    @Transactional
    public NgoAssignmentResponse claimReport(UUID sosReportId, UUID userId) {
        User user = getUser(userId);
        UUID ngoId = user.getNgoId();
        if (ngoId == null) throw new IllegalStateException("User is not linked to an NGO.");

        SosReport report = sosReportRepo.findById(sosReportId)
                .orElseThrow(() -> new ResourceNotFoundException("SOS Report not found: " + sosReportId));

        if (report.getCurrentStatus() != ReportStatus.REPORTED) {
            throw new IllegalStateException("This report is no longer available for claiming.");
        }

        boolean alreadyClaimed = assignmentRepo.findBySosReport_Id(sosReportId).stream()
                .anyMatch(a -> a.getAssignmentStatus() != AssignmentStatus.DECLINED
                            && a.getAssignmentStatus() != AssignmentStatus.REASSIGNED);
        if (alreadyClaimed) throw new IllegalStateException("This report has already been claimed.");

        NgoAssignment assignment = NgoAssignment.builder()
                .sosReport(report)
                .ngoId(ngoId)
                .volunteerId(userId)
                .assignmentStatus(AssignmentStatus.ACCEPTED)
                .acceptedAt(LocalDateTime.now())
                .build();

        report.setCurrentStatus(ReportStatus.DISPATCHED);
        sosReportRepo.save(report);

        return toResponse(assignmentRepo.save(assignment));
    }

    // ── Admin-assigned rescues for this NGO ──────────────────────────────────

    @Transactional(readOnly = true)
    public List<NgoAssignmentResponse> getAssignmentsForUser(UUID userId) {
        User user = getUser(userId);
        UUID ngoId = user.getNgoId();
        if (ngoId == null) return List.of();

        return assignmentRepo
                .findByNgoIdAndAssignmentStatusNotOrderByAssignedAtDesc(ngoId, AssignmentStatus.REASSIGNED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Accept a PENDING assignment ───────────────────────────────────────────

    @Transactional
    public NgoAssignmentResponse accept(UUID assignmentId, UUID userId) {
        NgoAssignment assignment = loadAndAuthorize(assignmentId, userId);
        if (assignment.getAssignmentStatus() != AssignmentStatus.PENDING) {
            throw new IllegalStateException("Only PENDING assignments can be accepted.");
        }

        assignment.setAssignmentStatus(AssignmentStatus.ACCEPTED);
        assignment.setAcceptedAt(LocalDateTime.now());

        SosReport report = assignment.getSosReport();
        report.setCurrentStatus(ReportStatus.DISPATCHED);
        sosReportRepo.save(report);

        return toResponse(assignmentRepo.save(assignment));
    }

    // ── Reject a PENDING assignment ───────────────────────────────────────────

    @Transactional
    public NgoAssignmentResponse reject(UUID assignmentId, UUID userId) {
        NgoAssignment assignment = loadAndAuthorize(assignmentId, userId);
        if (assignment.getAssignmentStatus() != AssignmentStatus.PENDING) {
            throw new IllegalStateException("Only PENDING assignments can be rejected.");
        }

        assignment.setAssignmentStatus(AssignmentStatus.DECLINED);
        assignmentRepo.save(assignment);

        SosReport report = assignment.getSosReport();

        // Immediately try the next NGO in queue; if none left, queue service marks REJECTED
        rescueQueueService.assignToNextNgo(report.getId());

        // Re-fetch saved assignment to return updated state
        return toResponse(assignmentRepo.findById(assignment.getId()).orElse(assignment));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private NgoAssignment loadAndAuthorize(UUID assignmentId, UUID userId) {
        User user = getUser(userId);
        NgoAssignment assignment = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        if (!assignment.getNgoId().equals(user.getNgoId())) {
            throw new SecurityException("This assignment does not belong to your NGO.");
        }
        return assignment;
    }

    private User getUser(UUID userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private NgoAssignmentResponse toOpenResponse(SosReport r) {
        User reporter = r.getReporter();
        return NgoAssignmentResponse.builder()
                .sosReportId(r.getId())
                .description(r.getDescription())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .urgencyLevel(r.getUrgencyLevel() != null ? r.getUrgencyLevel().name() : null)
                .sosStatus(r.getCurrentStatus() != null ? r.getCurrentStatus().name() : null)
                .assignmentStatus("OPEN")
                .reporterName(reporter != null ? reporter.getFullName() : null)
                .reporterPhone(reporter != null ? reporter.getPhone() : null)
                .reportedAt(r.getReportedAt())
                .build();
    }

    private NgoAssignmentResponse toResponse(NgoAssignment a) {
        SosReport r = a.getSosReport();
        User reporter = r.getReporter();
        return NgoAssignmentResponse.builder()
                .assignmentId(a.getId())
                .sosReportId(r.getId())
                .description(r.getDescription())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .urgencyLevel(r.getUrgencyLevel() != null ? r.getUrgencyLevel().name() : null)
                .sosStatus(r.getCurrentStatus() != null ? r.getCurrentStatus().name() : null)
                .assignmentStatus(a.getAssignmentStatus().name())
                .reporterName(reporter != null ? reporter.getFullName() : null)
                .reporterPhone(reporter != null ? reporter.getPhone() : null)
                .reportedAt(r.getReportedAt())
                .assignedAt(a.getAssignedAt())
                .build();
    }
}
