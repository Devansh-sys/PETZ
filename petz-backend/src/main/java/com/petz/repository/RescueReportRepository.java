package com.petz.repository;

import com.petz.entity.RescueReport;
import com.petz.enums.RescueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RescueReportRepository extends JpaRepository<RescueReport, Long> {
    List<RescueReport> findByReporterId(Long reporterId);
    List<RescueReport> findByStatus(RescueStatus status);
    List<RescueReport> findByAssignedNgo(Long ngoId);
    List<RescueReport> findByAssignedNgoAndStatus(Long ngoId, RescueStatus status);
    long countByAssignedNgoAndStatus(Long ngoId, RescueStatus status);
}
