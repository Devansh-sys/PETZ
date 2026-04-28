package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.ApproveRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.ClarifyRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.Detail;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.RejectRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.Summary;
import com.cts.mfrp.petzbackend.adoption.dto.KycDocumentDtos.DocumentResponse;
import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptionApplicationStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionApplication;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionApplicationRepository;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.common.service.NotificationService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Epic 2.4 — NGO reviewer service for application decisioning.
 *
 *   US-2.4.1 list        (filters + pagination + sort)
 *   US-2.4.2 getDetail   (full form + inline KYC docs)
 *   US-2.4.3 approve     (confirmation required)
 *   US-2.4.4 reject      (reason mandatory)
 *   US-2.4.5 clarify     (questions sent; status=CLARIFICATION_REQUESTED)
 *   US-2.4.6 verifyDoc   (delegated to KycDocumentService)
 *
 * NGO scoping: every mutation verifies {@code callerNgoId} matches the
 * application's {@code ngoId} (same pattern as Wave 1). Cross-NGO
 * reviewers get 404 so they can't even probe for application IDs
 * belonging to other NGOs.
 */
@Service
@RequiredArgsConstructor
public class AdoptionReviewService {

    private static final Logger log = LoggerFactory.getLogger(AdoptionReviewService.class);

    private final AdoptionApplicationRepository appRepo;
    private final AdoptionApplicationService    applicationService;  // reuse mappers
    private final KycDocumentService            kycService;
    private final AdoptionAuditService          auditService;
    private final NotificationService           notifications;

    // ═════════════════════════════════════════════════════════════════
    //  US-2.4.1 — List incoming applications (NGO queue view)
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public PageResponse<Summary> list(UUID callerNgoId,
                                      String statusRaw,
                                      UUID petId,
                                      LocalDate from,
                                      LocalDate to,
                                      Boolean unreviewed,
                                      String sort,
                                      int page,
                                      int size) {
        requireNgoBinding(callerNgoId);
        Specification<AdoptionApplication> spec = (root, q, cb) -> {
            Predicate p = cb.equal(root.get("ngoId"), callerNgoId);
            if (statusRaw != null && !statusRaw.isBlank()) {
                p = cb.and(p, cb.equal(root.get("status"), parseStatus(statusRaw)));
            }
            if (petId != null) {
                p = cb.and(p, cb.equal(root.get("adoptablePetId"), petId));
            }
            if (from != null) {
                p = cb.and(p, cb.greaterThanOrEqualTo(
                        root.get("createdAt"), from.atStartOfDay()));
            }
            if (to != null) {
                p = cb.and(p, cb.lessThan(
                        root.get("createdAt"), to.plusDays(1).atStartOfDay()));
            }
            if (Boolean.TRUE.equals(unreviewed)) {
                p = cb.and(p, cb.equal(root.get("status"),
                        AdoptionApplicationStatus.SUBMITTED));
            }
            return p;
        };

        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size),
                buildSort(sort));
        Page<AdoptionApplication> pageResult = appRepo.findAll(spec, pageable);
        return PageResponse.from(pageResult, applicationService::toSummary);
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.4.2 — View detail (inline KYC docs + history)
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Detail getDetail(UUID callerNgoId, UUID applicationId) {
        AdoptionApplication app = loadForReviewer(applicationId, callerNgoId);
        return applicationService.toDetail(app);
    }

    // ═════════════════════════════════════════════════════════════════
    //  Optional helper — US-2.4.2 "review start" (SUBMITTED -> UNDER_REVIEW)
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail startReview(UUID reviewerId, UUID callerNgoId, UUID applicationId) {
        AdoptionApplication app = loadForReviewer(applicationId, callerNgoId);
        if (app.getStatus() == AdoptionApplicationStatus.UNDER_REVIEW) {
            return applicationService.toDetail(app);        // idempotent
        }
        if (app.getStatus() != AdoptionApplicationStatus.SUBMITTED
                && app.getStatus() != AdoptionApplicationStatus.CLARIFICATION_REQUESTED) {
            throw new IllegalStateException(
                    "Cannot start review from status=" + app.getStatus());
        }
        app.setStatus(AdoptionApplicationStatus.UNDER_REVIEW);
        AdoptionApplication saved = appRepo.save(app);
        auditService.log(AuditTargetType.APPLICATION, saved.getId(), reviewerId,
                "REVIEW_STARTED", null, null);
        return applicationService.toDetail(saved);
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.4.3 — Approve
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail approve(UUID reviewerId, UUID callerNgoId, UUID applicationId,
                          ApproveRequest req) {
        AdoptionApplication app = loadForReviewer(applicationId, callerNgoId);
        requireReviewable(app);

        if (req == null || !Boolean.TRUE.equals(req.getConfirm())) {
            throw new IllegalArgumentException(
                    "Approval requires confirmation (send {\"confirm\":true}).");
        }

        app.setStatus(AdoptionApplicationStatus.APPROVED);
        app.setDecisionReason(req.getNotes());
        app.setDecidedAt(LocalDateTime.now());
        AdoptionApplication saved = appRepo.save(app);

        auditService.log(AuditTargetType.APPLICATION, saved.getId(), reviewerId,
                "APPROVED", req.getNotes(), null);
        notifications.notifyAdopterDecision(saved.getAdopterId(), saved.getId(),
                "APPROVED", req.getNotes());

        log.info("Application {} APPROVED by reviewer {}", saved.getId(), reviewerId);
        return applicationService.toDetail(saved);
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.4.4 — Reject
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail reject(UUID reviewerId, UUID callerNgoId, UUID applicationId,
                         RejectRequest req) {
        AdoptionApplication app = loadForReviewer(applicationId, callerNgoId);
        requireReviewable(app);

        app.setStatus(AdoptionApplicationStatus.REJECTED);
        app.setDecisionReason(req.getReason());
        app.setDecidedAt(LocalDateTime.now());
        AdoptionApplication saved = appRepo.save(app);

        auditService.log(AuditTargetType.APPLICATION, saved.getId(), reviewerId,
                "REJECTED", req.getReason(), null);
        notifications.notifyAdopterDecision(saved.getAdopterId(), saved.getId(),
                "REJECTED", req.getReason());

        log.info("Application {} REJECTED by reviewer {}", saved.getId(), reviewerId);
        return applicationService.toDetail(saved);
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.4.5 — Request clarification
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail clarify(UUID reviewerId, UUID callerNgoId, UUID applicationId,
                          ClarifyRequest req) {
        AdoptionApplication app = loadForReviewer(applicationId, callerNgoId);
        requireReviewable(app);

        String merged = String.join(" | ", req.getQuestions());
        app.setStatus(AdoptionApplicationStatus.CLARIFICATION_REQUESTED);
        app.setClarificationQuestions(merged);
        AdoptionApplication saved = appRepo.save(app);

        auditService.log(AuditTargetType.APPLICATION, saved.getId(), reviewerId,
                "CLARIFICATION_REQUESTED", merged, null);
        notifications.notifyAdopterClarification(saved.getAdopterId(), saved.getId(), merged);

        log.info("Application {} CLARIFICATION_REQUESTED by reviewer {}",
                saved.getId(), reviewerId);
        return applicationService.toDetail(saved);
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.4.6 — Verify KYC document (delegated)
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public DocumentResponse verifyDocument(UUID reviewerId, UUID callerNgoId,
                                           UUID applicationId, UUID docId,
                                           String statusRaw, String reason) {
        AdoptionApplication app = loadForReviewer(applicationId, callerNgoId);
        return kycService.verify(reviewerId, app, docId, statusRaw, reason);
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private AdoptionApplication loadForReviewer(UUID applicationId, UUID callerNgoId) {
        requireNgoBinding(callerNgoId);
        return appRepo.findByIdAndNgoId(applicationId, callerNgoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AdoptionApplication " + applicationId + " not found for this NGO"));
    }

    private void requireReviewable(AdoptionApplication app) {
        if (app.getStatus() == null || app.getStatus().isFinalized()) {
            throw new IllegalStateException(
                    "Application is already " + app.getStatus() + " — no further actions allowed.");
        }
    }

    private void requireNgoBinding(UUID callerNgoId) {
        if (callerNgoId == null) {
            throw new IllegalArgumentException(
                    "Reviewer is not bound to an NGO. Seed users.ngo_id first.");
        }
    }

    private AdoptionApplicationStatus parseStatus(String raw) {
        try {
            return AdoptionApplicationStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid status '" + raw + "'. Allowed values are the AdoptionApplicationStatus enum.");
        }
    }

    private Sort buildSort(String sort) {
        if (sort == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sort.toLowerCase()) {
            case "priority" -> Sort.by(Sort.Order.asc("status"),
                                       Sort.Order.desc("createdAt"));
            case "date", "newest", "recent" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private int clampSize(int size) {
        if (size <= 0) return 20;
        return Math.min(size, 100);
    }

    /** Silence unused-import lint (LocalTime kept reserved for future filters). */
    @SuppressWarnings("unused")
    private static LocalTime placeholder() { return LocalTime.MIN; }

    /** Likewise for List (future NGO filters may pass lists of statuses). */
    @SuppressWarnings("unused")
    private static List<AdoptionApplicationStatus> placeholderList() { return List.of(); }
}
