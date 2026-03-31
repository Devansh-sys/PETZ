package com.cts.mfrp.petzbackend.rescue.repository;

import com.cts.mfrp.petzbackend.rescue.model.MissionSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MissionSummaryRepository extends JpaRepository<MissionSummary, UUID> {

    Optional<MissionSummary> findByRescueMissionId(UUID rescueMissionId);
}
