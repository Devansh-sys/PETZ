package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionDisputeDtos.DisputeResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionDisputeDtos.RaiseDisputeRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionDisputeDtos.ResolveDisputeRequest;
import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.enums.DisputeStatus;
import com.cts.mfrp.petzbackend.adoption.model.Adoption;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionDispute;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionDisputeRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionRepository;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.common.service.NotificationService;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-2.6.3 — adoption dispute queue + resolution.
 *
 *   raise     any authenticated user raises a dispute against an Adoption
 *   list      admin queue (defaults to OPEN)
 *   getById   admin reads full detail (audit log provides history)
 *   resolve   admin records OVERRIDE / WARN / SUSPEND and a resolution
 *             note; also triggers side-effects:
 *               SUSPEND → Ngo.active = false
 *             (suspending individual users is not in scope of this wave)
 */
@Service
@RequiredArgsConstructor
public class AdoptionDisputeService {

    private static final Logger log = LoggerFactory.getLogger(AdoptionDisputeService.class);

    private final AdoptionDisputeRepository disputeRepo;
    private final AdoptionRepository        adoptionRepo;
    private final NgoRepository             ngoRepo;
    private final UserRepository            userRepo;
    private final AdoptionAuditService      auditService;
    private final NotificationService       notifications;

    @Transactional
    public DisputeResponse raise(UUID raiserId, RaiseDisputeRequest req) {
        Adoption adoption = adoptionRepo.findById(req.getAdoptionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Adoption", req.getAdoptionId()));

        AdoptionDispute dispute = AdoptionDispute.builder()
                .adoptionId(adoption.getId())
                .raisedByUserId(raiserId)
                .description(req.getDescription())
                .status(DisputeStatus.OPEN)
                .build();
        AdoptionDispute saved = disputeRepo.save(dispute);

        auditService.log(AuditTargetType.DISPUTE, saved.getId(), raiserId,
                "DISPUTE_RAISED", null,
                "{\"adoptionId\":\"" + adoption.getId() + "\"}");

        log.info("Dispute {} raised against adoption {} by user {}",
                saved.getId(), adoption.getId(), raiserId);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<DisputeResponse> list(String statusRaw, int page, int size) {
        DisputeStatus status = parseStatus(statusRaw);
        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdoptionDispute> pageResult = disputeRepo.findByStatus(status, pageable);
        return PageResponse.from(pageResult, this::toResponse);
    }

    @Transactional(readOnly = true)
    public DisputeResponse getById(UUID disputeId) {
        return disputeRepo.findById(disputeId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", disputeId));
    }

    @Transactional
    public DisputeResponse resolve(UUID adminId, UUID disputeId, ResolveDisputeRequest req) {
        AdoptionDispute dispute = disputeRepo.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute", disputeId));

        if (dispute.getStatus() == DisputeStatus.RESOLVED) {
            throw new IllegalStateException("Dispute is already resolved.");
        }

        String action = req.getAction().trim().toUpperCase();
        if (!("OVERRIDE".equals(action) || "WARN".equals(action) || "SUSPEND".equals(action))) {
            throw new IllegalArgumentException(
                    "Invalid action '" + req.getAction()
                            + "'. Allowed: OVERRIDE, WARN, SUSPEND");
        }

        // SUSPEND side-effect — flip owning NGO to inactive.
        if ("SUSPEND".equals(action)) {
            Adoption adoption = adoptionRepo.findById(dispute.getAdoptionId()).orElse(null);
            if (adoption != null) {
                ngoRepo.findById(adoption.getNgoId()).ifPresent(n -> {
                    n.setActive(false);
                    ngoRepo.save(n);
                });
            }
        }

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setAdminAction(action);
        dispute.setResolution(req.getResolution());
        dispute.setResolvedBy(adminId);
        dispute.setResolvedAt(LocalDateTime.now());
        AdoptionDispute saved = disputeRepo.save(dispute);

        auditService.log(AuditTargetType.DISPUTE, saved.getId(), adminId,
                "DISPUTE_RESOLVED_" + action, req.getResolution(), null);

        // Notify both parties (adopter + NGO owner when known).
        Adoption adoption = adoptionRepo.findById(saved.getAdoptionId()).orElse(null);
        if (adoption != null) {
            notifications.notifyDisputeResolved(adoption.getAdopterId(),
                    saved.getId(), action, req.getResolution());
            Ngo ngo = ngoRepo.findById(adoption.getNgoId()).orElse(null);
            if (ngo != null && ngo.getOwnerUserId() != null) {
                notifications.notifyDisputeResolved(ngo.getOwnerUserId(),
                        saved.getId(), action, req.getResolution());
            }
        }
        // Also ping the raiser (might be neither adopter nor NGO owner).
        User raiser = userRepo.findById(saved.getRaisedByUserId()).orElse(null);
        if (raiser != null) {
            notifications.notifyDisputeResolved(raiser.getId(),
                    saved.getId(), action, req.getResolution());
        }

        log.info("Dispute {} resolved with action={} by admin {}",
                saved.getId(), action, adminId);
        return toResponse(saved);
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private DisputeStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) return DisputeStatus.OPEN;
        try {
            return DisputeStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid status '" + raw + "'. Allowed: OPEN, RESOLVED");
        }
    }

    private int clampSize(int size) {
        if (size <= 0) return 20;
        return Math.min(size, 100);
    }

    private DisputeResponse toResponse(AdoptionDispute d) {
        return DisputeResponse.builder()
                .id(d.getId())
                .adoptionId(d.getAdoptionId())
                .raisedByUserId(d.getRaisedByUserId())
                .description(d.getDescription())
                .status(d.getStatus() != null ? d.getStatus().name() : null)
                .adminAction(d.getAdminAction())
                .resolution(d.getResolution())
                .resolvedBy(d.getResolvedBy())
                .resolvedAt(d.getResolvedAt())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
