package com.cts.mfrp.petzbackend.rescue.repository;

import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment;
import com.cts.mfrp.petzbackend.rescue.model.NgoAssignment.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NgoAssignmentRepository extends JpaRepository<NgoAssignment, UUID> {

    Optional<NgoAssignment> findBySosReportIdAndAssignmentStatus(
            UUID sosReportId, AssignmentStatus status);

    Optional<NgoAssignment> findBySosReportIdAndVolunteerId(
            UUID sosReportId, UUID volunteerId);

    List<NgoAssignment> findBySosReport_Id(UUID sosReportId);

    Optional<NgoAssignment> findBySosReport_IdAndAssignmentStatus(
            UUID sosReportId, AssignmentStatus status);

    Optional<NgoAssignment> findBySosReport_IdAndAssignmentStatusIn(
            UUID sosReportId, List<AssignmentStatus> statuses);

    /** All assignments for a given NGO, excluding REASSIGNED, newest first. */
    List<NgoAssignment> findByNgoIdAndAssignmentStatusNotOrderByAssignedAtDesc(
            UUID ngoId, AssignmentStatus status);

    /** Auto-queue: find PENDING assignments older than a cutoff (timed-out, need escalation). */
    List<NgoAssignment> findByAssignmentStatusAndAssignedAtBefore(AssignmentStatus status, LocalDateTime before);

    /**
     * Auto-queue: returns the SOS report IDs for timed-out PENDING assignments.
     * Uses JPQL to project directly — avoids lazy-loading the sosReport association.
     */
    @Query("SELECT a.sosReport.id FROM NgoAssignment a WHERE a.assignmentStatus = :status AND a.assignedAt < :before")
    List<UUID> findExpiredSosReportIds(@Param("status") AssignmentStatus status, @Param("before") LocalDateTime before);

    @Query("SELECT COUNT(n) FROM NgoAssignment n WHERE n.assignedAt BETWEEN :from AND :to")
    long countTotalDispatched(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(n) FROM NgoAssignment n WHERE n.assignmentStatus = 'ACCEPTED' AND n.acceptedAt BETWEEN :from AND :to")
    long countAccepted(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}