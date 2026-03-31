
// ============================================================
// FILE 7: rescue/repository/SosReportRepository.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.repository;

import com.cts.mfrp.petzbackend.rescue.model.SosReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SosReportRepository extends JpaRepository<SosReport, UUID> {
}

