package com.cts.mfrp.petzbackend.rescue.repository;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.rescue.model.RescueMission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RescueMissionRepository extends JpaRepository<RescueMission, UUID> {

    Optional<RescueMission> findBySosReportId(UUID sosReportId);

    List<RescueMission> findByRescueStatus(ReportStatus status);

    List<RescueMission> findByAssignedNgoUserId(UUID ngoUserId);

    // Queries merged from MissionRepository
    List<RescueMission> findByNgoStatus(String ngoStatus);
}
