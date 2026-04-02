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

    // Used by other services — keep as-is
    Optional<NgoAssignment> findBySosReportIdAndAssignmentStatus(
            UUID sosReportId, AssignmentStatus status);

    Optional<NgoAssignment> findBySosReportIdAndVolunteerId(
            UUID sosReportId, UUID volunteerId);

    List<NgoAssignment> findBySosReport_Id(UUID sosReportId);

    // ✅ Added for US-1.4.1 — navigate sosReport.id via underscore notation
    Optional<NgoAssignment> findBySosReport_IdAndVolunteerId(
            UUID sosReportId, UUID volunteerId);

    // ✅ Added for US-1.5.4 — already existed but confirming signature
    Optional<NgoAssignment> findBySosReport_IdAndAssignmentStatus(
            UUID sosReportId, AssignmentStatus status);

    Optional<NgoAssignment> findBySosReport_IdAndAssignmentStatusIn(
            UUID sosReportId, List<AssignmentStatus> statuses);

    @Query("SELECT COUNT(n) FROM NgoAssignment n WHERE n.assignedAt BETWEEN :from AND :to")
    long countTotalDispatched(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(n) FROM NgoAssignment n WHERE n.assignmentStatus = 'ACCEPTED' AND n.acceptedAt BETWEEN :from AND :to")
    long countAccepted(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}