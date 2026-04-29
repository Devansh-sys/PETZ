package com.cts.mfrp.petzbackend.adoption.repository;

import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AdoptionAuditLogRepository extends JpaRepository<AdoptionAuditLog, UUID> {

    List<AdoptionAuditLog> findByTargetTypeAndTargetIdOrderByPerformedAtDesc(
            AuditTargetType targetType, UUID targetId);

    @Query("""
        SELECT a FROM AdoptionAuditLog a
        WHERE (:targetType IS NULL OR a.targetType = :targetType)
          AND (:targetId   IS NULL OR a.targetId   = :targetId)
          AND (:actorId    IS NULL OR a.actorId    = :actorId)
          AND (:from       IS NULL OR a.performedAt >= :from)
          AND (:to         IS NULL OR a.performedAt <= :to)
        ORDER BY a.performedAt DESC
        """)
    Page<AdoptionAuditLog> findFiltered(
            @Param("targetType") AuditTargetType targetType,
            @Param("targetId")   UUID targetId,
            @Param("actorId")    UUID actorId,
            @Param("from")       LocalDateTime from,
            @Param("to")         LocalDateTime to,
            Pageable pageable);
}
