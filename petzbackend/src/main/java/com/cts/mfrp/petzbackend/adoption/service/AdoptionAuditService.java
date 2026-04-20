package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionAuditLog;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Shared helper for writing to {@code adoption_audit_logs}.
 *
 * Used by every mutation in Wave 1, Wave 2, Wave 3. Controllers NEVER
 * write audit rows directly — they call the domain service, which in
 * turn calls {@link #log}. This keeps the audit trail consistent.
 *
 *   Wave 1 — US-2.2.2 AC#3 "Audit log per edit"
 *   Wave 2 — US-2.4.3 / 2.4.4 / 2.4.5 / 2.4.6 decision trail
 *   Wave 3 — US-2.5.2 adoption finalization, US-2.6.2 NGO verification
 */
@Service
@RequiredArgsConstructor
public class AdoptionAuditService {

    private final AdoptionAuditLogRepository auditRepo;

    /**
     * Append one audit row. Pass null for {@code actorId} when the change
     * is system-triggered (e.g. scheduled job). Pass null for
     * {@code reason}/{@code metadata} when not applicable.
     */
    @Transactional
    public AdoptionAuditLog log(AuditTargetType targetType,
                                UUID targetId,
                                UUID actorId,
                                String action,
                                String reason,
                                String metadata) {
        AdoptionAuditLog row = AdoptionAuditLog.builder()
                .targetType(targetType)
                .targetId(targetId)
                .actorId(actorId)
                .action(action)
                .reason(reason)
                .metadata(metadata)
                .build();
        return auditRepo.save(row);
    }

    /** Convenience overload when there's no metadata payload. */
    @Transactional
    public AdoptionAuditLog log(AuditTargetType targetType,
                                UUID targetId,
                                UUID actorId,
                                String action,
                                String reason) {
        return log(targetType, targetId, actorId, action, reason, null);
    }

    @Transactional(readOnly = true)
    public List<AdoptionAuditLog> history(AuditTargetType targetType, UUID targetId) {
        return auditRepo.findByTargetTypeAndTargetIdOrderByPerformedAtDesc(
                targetType, targetId);
    }
}
