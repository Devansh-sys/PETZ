package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionFollowUpDtos.FollowUpResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionFollowUpDtos.RecordFollowUpRequest;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.enums.FollowUpStatus;
import com.cts.mfrp.petzbackend.adoption.model.Adoption;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionFollowUp;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionFollowUpRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionRepository;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * US-2.5.3 read helpers + US-2.5.4 NGO records outcome.
 *
 * Scheduled reminders live in {@code AdoptionFollowUpReminderJob}; this
 * service is what the PATCH endpoint and list endpoint call.
 */
@Service
@RequiredArgsConstructor
public class AdoptionFollowUpService {

    private static final Logger log = LoggerFactory.getLogger(AdoptionFollowUpService.class);

    private final AdoptionFollowUpRepository followUpRepo;
    private final AdoptionRepository         adoptionRepo;
    private final AdoptionAuditService       auditService;

    @Transactional(readOnly = true)
    public List<FollowUpResponse> listForAdoption(UUID adoptionId) {
        if (!adoptionRepo.existsById(adoptionId)) {
            throw new ResourceNotFoundException("Adoption", adoptionId);
        }
        return followUpRepo.findByAdoptionIdOrderByDueDateAsc(adoptionId).stream()
                .map(this::toResponse).toList();
    }

    /**
     * US-2.5.4 — NGO records an outcome on a specific follow-up.
     *
     * Allowed transitions:
     *   SCHEDULED -> COMPLETED
     *   SCHEDULED -> FLAGGED
     *   FLAGGED   -> COMPLETED  (concern resolved later)
     *
     * A FLAGGED outcome auto-sets {@code concernFlag=true} so the admin
     * dashboard can surface it (US-2.5.4 AC#4).
     */
    @Transactional
    public FollowUpResponse record(UUID reviewerId, UUID callerNgoId,
                                   UUID adoptionId, UUID followUpId,
                                   RecordFollowUpRequest req) {
        Adoption adoption = loadForNgo(adoptionId, callerNgoId);
        AdoptionFollowUp row = followUpRepo.findByIdAndAdoptionId(followUpId, adoptionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "FollowUp " + followUpId + " not found on adoption " + adoptionId));

        FollowUpStatus next = parseStatus(req.getStatus());
        if (next == FollowUpStatus.SCHEDULED) {
            throw new IllegalArgumentException(
                    "Cannot move a follow-up back to SCHEDULED.");
        }

        row.setStatus(next);
        if (req.getNotes() != null) row.setNotes(req.getNotes());
        boolean flag = next == FollowUpStatus.FLAGGED
                || Boolean.TRUE.equals(req.getConcernFlag());
        row.setConcernFlag(flag);
        row.setCompletedAt(LocalDateTime.now());
        row.setCompletedBy(reviewerId);
        AdoptionFollowUp saved = followUpRepo.save(row);

        auditService.log(AuditTargetType.ADOPTION, adoption.getId(), reviewerId,
                next == FollowUpStatus.COMPLETED ? "FOLLOW_UP_COMPLETED" : "FOLLOW_UP_FLAGGED",
                req.getNotes(),
                "{\"followUpId\":\"" + saved.getId() + "\",\"type\":\""
                        + saved.getFollowUpType() + "\"}");

        log.info("Follow-up {} on adoption {} marked {} by reviewer {}",
                saved.getId(), adoption.getId(), next, reviewerId);
        return toResponse(saved);
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private Adoption loadForNgo(UUID adoptionId, UUID callerNgoId) {
        if (callerNgoId == null) {
            throw new IllegalArgumentException(
                    "Caller is not bound to an NGO. Seed users.ngo_id first.");
        }
        return adoptionRepo.findByIdAndNgoId(adoptionId, callerNgoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Adoption " + adoptionId + " not found for this NGO"));
    }

    private FollowUpStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException(
                    "status is required. Allowed: COMPLETED, FLAGGED");
        }
        try {
            return FollowUpStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid status '" + raw + "'. Allowed: COMPLETED, FLAGGED");
        }
    }

    FollowUpResponse toResponse(AdoptionFollowUp f) {
        return FollowUpResponse.builder()
                .id(f.getId())
                .adoptionId(f.getAdoptionId())
                .followUpType(f.getFollowUpType() != null ? f.getFollowUpType().name() : null)
                .dueDate(f.getDueDate())
                .status(f.getStatus() != null ? f.getStatus().name() : null)
                .notes(f.getNotes())
                .concernFlag(f.isConcernFlag())
                .completedAt(f.getCompletedAt())
                .completedBy(f.getCompletedBy())
                .reminderSentAt(f.getReminderSentAt())
                .createdAt(f.getCreatedAt())
                .build();
    }
}
