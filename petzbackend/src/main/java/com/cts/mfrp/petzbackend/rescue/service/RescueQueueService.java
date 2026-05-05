package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment.AssignmentStatus;
import com.cts.mfrp.petzbackend.rescue.repository.NgoAssignmentRepository;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import com.cts.mfrp.petzbackend.sosreport.repository.SosReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Automatic NGO queue management for rescue assignments.
 *
 * Queue order: active NGOs with an assigned representative, sorted by
 * registration date (earliest registered = position #1 in queue).
 *
 * Flow:
 *   1. SOS reported → assignToNextNgo() → SOS becomes ASSIGNED, first NGO gets PENDING
 *   2a. NGO accepts → DISPATCHED (handled by NgoRescueService)
 *   2b. NGO rejects → assignToNextNgo() called again → next NGO gets PENDING
 *   2c. 30 min with no response → scheduler calls assignToNextNgo() → next NGO gets PENDING
 *   3. All NGOs exhausted → SOS marked REJECTED
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RescueQueueService {

    private static final int TIMEOUT_MINUTES = 10;

    private final NgoRepository           ngoRepo;
    private final NgoAssignmentRepository assignmentRepo;
    private final SosReportRepository     sosReportRepo;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Assigns the SOS to the next eligible NGO in queue order.
     * Safe to call multiple times — skips NGOs that already tried this rescue.
     */
    @Transactional
    public void assignToNextNgo(UUID sosReportId) {
        SosReport report = sosReportRepo.findById(sosReportId).orElse(null);
        if (report == null) return;

        // Don't touch already-resolved rescues
        ReportStatus status = report.getCurrentStatus();
        if (status == ReportStatus.DISPATCHED
                || status == ReportStatus.ON_SITE
                || status == ReportStatus.TRANSPORTING
                || status == ReportStatus.COMPLETE
                || status == ReportStatus.MISSION_COMPLETE
                || status == ReportStatus.CLOSED) {
            return;
        }

        List<NgoAssignment> all = assignmentRepo.findBySosReport_Id(sosReportId);

        // Mark any still-PENDING assignment as timed-out / superseded
        all.stream()
                .filter(a -> a.getAssignmentStatus() == AssignmentStatus.PENDING)
                .forEach(a -> {
                    a.setAssignmentStatus(AssignmentStatus.REASSIGNED);
                    a.setReassignmentReason("Auto-escalated by rescue queue");
                    assignmentRepo.save(a);
                });

        // NGOs already tried for this report (declined or timed-out)
        Set<UUID> tried = all.stream()
                .filter(a -> a.getAssignmentStatus() == AssignmentStatus.DECLINED
                          || a.getAssignmentStatus() == AssignmentStatus.REASSIGNED)
                .map(NgoAssignment::getNgoId)
                .collect(Collectors.toSet());

        // Find the next eligible NGO: active + has a rep + not already tried, by registration order
        Ngo next = ngoRepo.findByActiveTrueAndOwnerUserIdIsNotNullOrderByCreatedAtAsc()
                .stream()
                .filter(n -> !tried.contains(n.getId()))
                .findFirst()
                .orElse(null);

        if (next == null) {
            log.warn("SOS {}: all NGOs exhausted — marking REJECTED", sosReportId);
            report.setCurrentStatus(ReportStatus.REJECTED);
            sosReportRepo.save(report);
            return;
        }

        // Create PENDING assignment for the next NGO
        NgoAssignment assignment = NgoAssignment.builder()
                .sosReport(report)
                .ngoId(next.getId())
                .volunteerId(next.getOwnerUserId())
                .assignmentStatus(AssignmentStatus.PENDING)
                .build();
        assignmentRepo.save(assignment);

        // Advance SOS status to ASSIGNED (reporter sees "Admin Assigned NGO ✓")
        report.setCurrentStatus(ReportStatus.ASSIGNED);
        sosReportRepo.save(report);

        log.info("SOS {} auto-assigned to NGO '{}' ({})", sosReportId, next.getName(), next.getId());
    }

    // ── Scheduled escalation ──────────────────────────────────────────────────

    /**
     * Runs every 5 minutes.
     * Finds PENDING assignments older than TIMEOUT_MINUTES and escalates each
     * to the next NGO in queue.
     *
     * @Transactional is required here so the Spring proxy keeps a JPA session
     * open for the entire method — avoiding LazyInitializationException.
     * (Self-invoked @Transactional methods bypass the proxy, so the transaction
     * must be declared on this outermost entry point instead.)
     */
    @Transactional
    @Scheduled(fixedDelay = 5 * 60 * 1000)
    public void escalateExpiredAssignments() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(TIMEOUT_MINUTES);

        // JPQL projection — returns SOS IDs directly, no lazy-load traversal needed
        List<UUID> expiredSosIds = assignmentRepo
                .findExpiredSosReportIds(AssignmentStatus.PENDING, cutoff);

        if (expiredSosIds.isEmpty()) return;

        log.info("Auto-queue: escalating {} timed-out assignment(s)", expiredSosIds.size());
        for (UUID sosId : expiredSosIds) {
            assignToNextNgo(sosId);
        }
    }
}
