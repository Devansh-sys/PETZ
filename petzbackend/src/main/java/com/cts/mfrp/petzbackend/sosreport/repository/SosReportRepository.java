package com.cts.mfrp.petzbackend.sosreport.repository;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.UrgencyLevel;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SosReportRepository extends JpaRepository<SosReport, UUID> {

    List<SosReport> findByReporterId(UUID reporterId);

    List<SosReport> findByCurrentStatus(ReportStatus status);

    List<SosReport> findByUrgencyLevel(UrgencyLevel urgencyLevel);

    List<SosReport> findByUrgencyLevelAndCurrentStatus(
            UrgencyLevel urgencyLevel, ReportStatus status);
}