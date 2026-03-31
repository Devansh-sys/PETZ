package com.cts.mfrp.petzbackend.rescue.repository;

import com.cts.mfrp.petzbackend.rescue.model.CaseVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CaseVerificationRepository extends JpaRepository<CaseVerification, UUID> {

    Optional<CaseVerification> findByRescueMissionId(UUID rescueMissionId);
}
