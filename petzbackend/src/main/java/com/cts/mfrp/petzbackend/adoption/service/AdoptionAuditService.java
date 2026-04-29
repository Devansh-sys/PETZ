package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.AuditLogResponse;
import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionAuditLog;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdoptionAuditService {

    private final AdoptionAuditLogRepository auditRepo;

    @Transactional
    public AdoptionAuditLog log(AuditTargetType targetType, UUID targetId, UUID actorId,
                                String action, String reason, String metadata) {
        AdoptionAuditLog row = AdoptionAuditLog.builder()
                .targetType(targetType).targetId(targetId).actorId(actorId)
                .action(action).reason(reason).metadata(metadata)
                .build();
        return auditRepo.save(row);
    }

    @Transactional
    public AdoptionAuditLog log(AuditTargetType targetType, UUID targetId, UUID actorId,
                                String action, String reason) {
        return log(targetType, targetId, actorId, action, reason, null);
    }

    @Transactional(readOnly = true)
    public List<AdoptionAuditLog> history(AuditTargetType targetType, UUID targetId) {
        return auditRepo.findByTargetTypeAndTargetIdOrderByPerformedAtDesc(targetType, targetId);
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> listFiltered(
            AuditTargetType targetType, UUID targetId, UUID actorId,
            LocalDateTime from, LocalDateTime to, int page, int size) {
        var result = auditRepo.findFiltered(targetType, targetId, actorId, from, to, PageRequest.of(page, size));
        return PageResponse.from(result, AuditLogResponse::from);
    }
}
