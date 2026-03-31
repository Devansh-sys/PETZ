package com.cts.mfrp.petzbackend.sosreport.repository;

import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * SosReport repository — used by NgoService for status logging.
 * Teammates working on Epic 1.2 (SOS Report Capture) will add
 * more query methods here as needed.
 */
@Repository
public interface SosReportRepository extends JpaRepository<SosReport, UUID> {
}