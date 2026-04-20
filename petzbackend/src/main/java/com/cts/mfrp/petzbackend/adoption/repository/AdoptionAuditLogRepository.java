package com.cts.mfrp.petzbackend.adoption.repository;

import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Append-only repository for adoption audit trail.
 *
 * No custom write methods — all writes go through
 * {@code AdoptionAuditService.log(...)}.
 */
@Repository
public interface AdoptionAuditLogRepository extends JpaRepository<AdoptionAuditLog, UUID> {

    /** Audit history for a given entity, newest first. */
    List<AdoptionAuditLog> findByTargetTypeAndTargetIdOrderByPerformedAtDesc(
            AuditTargetType targetType, UUID targetId);
}
