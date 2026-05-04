package com.cts.mfrp.petzbackend.sosreport.repository;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * SosReport repository — shared across all modules.
 * Contains queries for SOS creation, rescue history, admin map, and KPIs.
 */
@Repository
public interface SosReportRepository extends JpaRepository<SosReport, UUID> {

    /** US-1.7.2 – All SOS reports submitted by a user, newest first. */
    List<SosReport> findByReporter_IdOrderByReportedAtDesc(UUID reporterId);

    /** US-1.8.1 – All non-completed rescues for admin live map. */
    List<SosReport> findByCurrentStatusNot(ReportStatus status);

    /** NGO open-reports feed — all REPORTED (unassigned) rescues, newest first. */
    List<SosReport> findByCurrentStatusOrderByReportedAtDesc(ReportStatus status);

    /** US-1.8.3 – KPI: count completed rescues in a date range. */
    @Query("""
        SELECT COUNT(s) FROM SosReport s
        WHERE s.currentStatus = com.cts.mfrp.petzbackend.enums.ReportStatus.COMPLETE
          AND (:from IS NULL OR s.reportedAt >= :from)
          AND (:to   IS NULL OR s.reportedAt <= :to)
    """)
    long countCompleted(@Param("from") LocalDateTime from,
                        @Param("to")   LocalDateTime to);

    /** US-1.8.3 – KPI: total SOS in a date range. */
    @Query("""
        SELECT COUNT(s) FROM SosReport s
        WHERE (:from IS NULL OR s.reportedAt >= :from)
          AND (:to   IS NULL OR s.reportedAt <= :to)
    """)
    long countAll(@Param("from") LocalDateTime from,
                  @Param("to")   LocalDateTime to);

    /**
     * US-1.8.3 – KPI: average minutes from SOS creation to volunteer acceptance.
     * Uses TIMESTAMPDIFF for MySQL compatibility.
     */
    @Query("""
        SELECT AVG(TIMESTAMPDIFF(MINUTE, s.reportedAt, a.acceptedAt))
        FROM SosReport s
        JOIN NgoAssignment a ON a.sosReport.id = s.id
        WHERE a.acceptedAt IS NOT NULL
          AND (:from IS NULL OR s.reportedAt >= :from)
          AND (:to   IS NULL OR s.reportedAt <= :to)
    """)
    Double avgMinutesToAcceptance(@Param("from") LocalDateTime from,
                                  @Param("to")   LocalDateTime to);


}