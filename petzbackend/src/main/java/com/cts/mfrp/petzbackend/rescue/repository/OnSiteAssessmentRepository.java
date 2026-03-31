
// ============================================================
// FILE 9: rescue/repository/OnSiteAssessmentRepository.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.repository;

import com.cts.mfrp.petzbackend.rescue.model.OnSiteAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OnSiteAssessmentRepository extends JpaRepository<OnSiteAssessment, UUID> {

    Optional<OnSiteAssessment> findBySosReportId(UUID sosReportId);
}
