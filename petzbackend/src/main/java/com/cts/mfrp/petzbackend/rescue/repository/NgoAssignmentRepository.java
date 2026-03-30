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

    /**
     * US-1.8.2 – Find the current active assignment for a rescue so it can be
     * marked REASSIGNED before a new one is created.
     */
    Optional<NgoAssignment> findBySosReport_IdAndAssignmentStatusIn(
            UUID sosReportId, List<AssignmentStatus> statuses);

    /**
     * US-1.8.1 – All assignments for a given SOS (for map enrichment).
     */
    List<NgoAssignment> findBySosReport_Id(UUID sosReportId);

    /**
     * US-1.8.3 – KPI: count of dispatches where volunteer accepted.
     */
    @Query("""
        SELECT COUNT(a) FROM NgoAssignment a
        WHERE a.assignmentStatus = 'ACCEPTED'
          AND (:from IS NULL OR a.assignedAt >= :from)
          AND (:to   IS NULL OR a.assignedAt <= :to)
    """)
    long countAccepted(@Param("from") LocalDateTime from,
                       @Param("to")   LocalDateTime to);

    /**
     * US-1.8.3 – KPI: total dispatches (excludes REASSIGNED to avoid double-count).
     */
    @Query("""
        SELECT COUNT(a) FROM NgoAssignment a
        WHERE a.assignmentStatus <> com.cts.mfrp.petzbackend.rescue.model.NgoAssignment$AssignmentStatus.REASSIGNED
          AND (:from IS NULL OR a.assignedAt >= :from)
          AND (:to   IS NULL OR a.assignedAt <= :to)
    """)
    long countTotalDispatched(@Param("from") LocalDateTime from,
                              @Param("to")   LocalDateTime to);
}