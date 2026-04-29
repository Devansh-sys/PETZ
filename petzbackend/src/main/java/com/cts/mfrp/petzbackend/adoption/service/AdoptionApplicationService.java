package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.ConsentSection;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.Detail;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.ExperienceSection;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.LifestyleSection;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.PersonalSection;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.StartRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.StatusHistoryEntry;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.Summary;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionApplicationDtos.WithdrawRequest;
import com.cts.mfrp.petzbackend.adoption.dto.KycDocumentDtos.DocumentResponse;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptablePetStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptionApplicationStatus;
import com.cts.mfrp.petzbackend.adoption.enums.ApplicationStep;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.model.AdoptablePet;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionApplication;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionAuditLog;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptablePetRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionApplicationRepository;
import com.cts.mfrp.petzbackend.adoption.repository.KycDocumentRepository;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.common.service.NotificationService;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Epic 2.3 — adopter-facing service for the application workflow.
 *
 *   US-2.3.1 start (creates DRAFT, 409 on duplicate active)
 *   US-2.3.2 patchPersonal / patchLifestyle / patchExperience / patchConsent
 *            (each touches lastActivityAt; re-opens UNDER_REVIEW if
 *            status=CLARIFICATION_REQUESTED)
 *   US-2.3.3 submit  (all required sections + consent flags must be set)
 *   US-2.3.5 getDetail + history
 *   US-2.3.6 withdraw
 */
@Service
@RequiredArgsConstructor
public class AdoptionApplicationService {

    private static final Logger log = LoggerFactory.getLogger(AdoptionApplicationService.class);

    private static final List<AdoptionApplicationStatus> ACTIVE_STATUSES = List.of(
            AdoptionApplicationStatus.DRAFT,
            AdoptionApplicationStatus.SUBMITTED,
            AdoptionApplicationStatus.UNDER_REVIEW,
            AdoptionApplicationStatus.CLARIFICATION_REQUESTED);

    private static final List<AdoptionApplicationStatus> SUBMITTED_STATUSES = List.of(
            AdoptionApplicationStatus.SUBMITTED,
            AdoptionApplicationStatus.UNDER_REVIEW,
            AdoptionApplicationStatus.CLARIFICATION_REQUESTED);

    private final AdoptionApplicationRepository appRepo;
    private final AdoptablePetRepository        petRepo;
    private final KycDocumentRepository         docRepo;
    private final NgoRepository                 ngoRepo;
    private final UserRepository                userRepo;
    private final AdoptionAuditService          auditService;
    private final KycDocumentService            kycService;
    private final NotificationService           notifications;

    // ═════════════════════════════════════════════════════════════════
    //  US-2.3.1 — Start
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail start(UUID adopterId, StartRequest req) {
        AdoptablePet pet = petRepo.findById(req.getAdoptablePetId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AdoptablePet", req.getAdoptablePetId()));

        // If this adopter already has an active application, let them resume regardless of pet status.
        Optional<AdoptionApplication> existing = appRepo.findFirstByAdopterIdAndAdoptablePetIdAndStatusIn(
                adopterId, pet.getId(), ACTIVE_STATUSES);
        if (existing.isPresent()) {
            return toDetail(existing.get());
        }

        // No existing application — check pet availability for new applications.
        if (pet.getStatus() == AdoptablePetStatus.ON_HOLD) {
            throw new IllegalStateException(
                    "This pet is currently under consideration by another adopter.");
        }
        if (pet.getStatus() != AdoptablePetStatus.LISTED) {
            throw new IllegalStateException(
                    "Pet is not currently accepting applications (status=" + pet.getStatus() + ").");
        }

        AdoptionApplication app = AdoptionApplication.builder()
                .adopterId(adopterId)
                .adoptablePetId(pet.getId())
                .ngoId(pet.getNgoId())
                .status(AdoptionApplicationStatus.DRAFT)
                .currentStep(ApplicationStep.PERSONAL)
                .build();

        // Pre-fill the personal section from the user's stored profile when
        // available — reduces re-typing on the first step (small UX bonus).
        userRepo.findById(adopterId).ifPresent(u -> {
            app.setFullName(u.getFullName());
            app.setPhone(u.getPhone());
            app.setEmail(u.getEmail());
        });

        AdoptionApplication saved = appRepo.save(app);

        auditService.log(AuditTargetType.APPLICATION, saved.getId(), adopterId,
                "APPLICATION_STARTED", null, null);

        log.info("Adoption application {} started by adopter {} for pet {}",
                saved.getId(), adopterId, pet.getId());
        return toDetail(saved);
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.3.2 — Auto-save per step
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail patchPersonal(UUID adopterId, UUID applicationId, PersonalSection s) {
        AdoptionApplication app = loadForAdopter(applicationId, adopterId, true);
        app.setFullName(s.getFullName());
        app.setPhone(s.getPhone());
        app.setEmail(s.getEmail());
        app.setAddressLine(s.getAddressLine());
        app.setCity(s.getCity());
        app.setPincode(s.getPincode());
        return saveStep(app, adopterId, ApplicationStep.PERSONAL, "PERSONAL_UPDATED");
    }

    @Transactional
    public Detail patchLifestyle(UUID adopterId, UUID applicationId, LifestyleSection s) {
        AdoptionApplication app = loadForAdopter(applicationId, adopterId, true);
        app.setHousingType(s.getHousingType());
        app.setHasYard(s.getHasYard());
        app.setOtherPetsCount(s.getOtherPetsCount());
        app.setWorkScheduleHours(s.getWorkScheduleHours());
        return saveStep(app, adopterId, ApplicationStep.LIFESTYLE, "LIFESTYLE_UPDATED");
    }

    @Transactional
    public Detail patchExperience(UUID adopterId, UUID applicationId, ExperienceSection s) {
        AdoptionApplication app = loadForAdopter(applicationId, adopterId, true);
        app.setPrevPetOwnership(s.getPrevPetOwnership());
        app.setPrevPetDetails(s.getPrevPetDetails());
        app.setVetSupport(s.getVetSupport());
        return saveStep(app, adopterId, ApplicationStep.EXPERIENCE, "EXPERIENCE_UPDATED");
    }

    @Transactional
    public Detail patchConsent(UUID adopterId, UUID applicationId, ConsentSection s) {
        AdoptionApplication app = loadForAdopter(applicationId, adopterId, true);
        app.setConsentHomeVisit(s.getConsentHomeVisit());
        app.setConsentFollowUp(s.getConsentFollowUp());
        app.setConsentBackgroundCheck(s.getConsentBackgroundCheck());
        return saveStep(app, adopterId, ApplicationStep.CONSENT, "CONSENT_UPDATED");
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.3.3 — Submit
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail submit(UUID adopterId, UUID applicationId) {
        AdoptionApplication app = loadForAdopter(applicationId, adopterId, false);

        if (app.getStatus() != AdoptionApplicationStatus.DRAFT) {
            throw new IllegalStateException(
                    "Application is not a draft (status=" + app.getStatus() + ").");
        }

        // Required completeness checks
        if (isBlank(app.getFullName()) || isBlank(app.getPhone())) {
            throw new IllegalArgumentException(
                    "Personal section is incomplete (fullName and phone are required).");
        }
        if (!Boolean.TRUE.equals(app.getConsentHomeVisit())
                || !Boolean.TRUE.equals(app.getConsentFollowUp())
                || !Boolean.TRUE.equals(app.getConsentBackgroundCheck())) {
            throw new IllegalArgumentException(
                    "All three consent checkboxes must be accepted before submission.");
        }

        app.setStatus(AdoptionApplicationStatus.SUBMITTED);
        app.setCurrentStep(ApplicationStep.REVIEW);
        app.setSubmittedAt(LocalDateTime.now());
        app.setLastActivityAt(LocalDateTime.now());
        AdoptionApplication saved = appRepo.save(app);

        // Put pet ON_HOLD so no other adopter can start a new application.
        petRepo.findById(saved.getAdoptablePetId()).ifPresent(p -> {
            if (p.getStatus() == AdoptablePetStatus.LISTED) {
                p.setStatus(AdoptablePetStatus.ON_HOLD);
                petRepo.save(p);
            }
        });

        auditService.log(AuditTargetType.APPLICATION, saved.getId(), adopterId,
                "APPLICATION_SUBMITTED", null, null);

        notifications.notifyNgoNewApplication(saved.getNgoId(), saved.getId(),
                "Application submitted by adopter " + adopterId);

        log.info("Application {} submitted by adopter {}", saved.getId(), adopterId);
        return toDetail(saved);
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.3.5 — Read detail / list mine
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Detail getDetail(UUID adopterId, UUID applicationId) {
        AdoptionApplication app = loadForAdopter(applicationId, adopterId, false);
        return toDetail(app);
    }

    @Transactional(readOnly = true)
    public List<Summary> listMine(UUID adopterId) {
        List<AdoptionApplication> rows =
                appRepo.findByAdopterIdOrderByCreatedAtDesc(adopterId);
        return rows.stream().map(this::toSummary).toList();
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.3.6 — Withdraw
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail withdraw(UUID adopterId, UUID applicationId, WithdrawRequest req) {
        AdoptionApplication app = loadForAdopter(applicationId, adopterId, false);

        if (app.getStatus() == null || !app.getStatus().isActive()) {
            throw new IllegalStateException(
                    "Only non-finalized applications can be withdrawn (current="
                            + app.getStatus() + ").");
        }

        app.setStatus(AdoptionApplicationStatus.WITHDRAWN);
        app.setDecidedAt(LocalDateTime.now());
        app.setLastActivityAt(LocalDateTime.now());
        String reason = req != null ? req.getReason() : null;
        AdoptionApplication saved = appRepo.save(app);

        // Release pet back to LISTED if no other active submissions remain.
        releaseIfNoActiveSubmissions(saved.getAdoptablePetId());

        auditService.log(AuditTargetType.APPLICATION, saved.getId(), adopterId,
                "WITHDRAWN", reason, null);

        notifications.notifyNgoNewApplication(saved.getNgoId(), saved.getId(),
                "Application withdrawn by adopter");

        log.info("Application {} withdrawn by adopter {}", saved.getId(), adopterId);
        return toDetail(saved);
    }

    private void releaseIfNoActiveSubmissions(UUID petId) {
        boolean hasActive = !appRepo.findByAdoptablePetIdAndStatusIn(petId, SUBMITTED_STATUSES).isEmpty();
        if (!hasActive) {
            petRepo.findById(petId).ifPresent(p -> {
                if (p.getStatus() == AdoptablePetStatus.ON_HOLD) {
                    p.setStatus(AdoptablePetStatus.LISTED);
                    petRepo.save(p);
                }
            });
        }
    }

    // ─── helpers ─────────────────────────────────────────────────────

    /**
     * Load an application scoped to the adopter.
     * When {@code mutableOnly=true} we refuse to modify a finalized app.
     */
    private AdoptionApplication loadForAdopter(UUID applicationId, UUID adopterId,
                                               boolean mutableOnly) {
        AdoptionApplication app = appRepo.findByIdAndAdopterId(applicationId, adopterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AdoptionApplication " + applicationId + " not found for this user"));
        if (mutableOnly && app.getStatus() != null && app.getStatus().isFinalized()) {
            throw new IllegalStateException(
                    "Cannot modify a " + app.getStatus() + " application.");
        }
        return app;
    }

    /**
     * Persist a step patch.
     * US-2.4.5 — if NGO had asked for clarification, any adopter edit bumps
     * the app back to UNDER_REVIEW so the NGO reviewer re-evaluates.
     */
    private Detail saveStep(AdoptionApplication app, UUID adopterId,
                            ApplicationStep step, String action) {
        app.setCurrentStep(step);
        app.setLastActivityAt(LocalDateTime.now());
        if (app.getStatus() == AdoptionApplicationStatus.CLARIFICATION_REQUESTED) {
            app.setStatus(AdoptionApplicationStatus.UNDER_REVIEW);
            auditService.log(AuditTargetType.APPLICATION, app.getId(), adopterId,
                    "RE_OPENED_AFTER_CLARIFICATION", null, null);
        }
        AdoptionApplication saved = appRepo.save(app);
        auditService.log(AuditTargetType.APPLICATION, saved.getId(), adopterId,
                action, null, null);
        return toDetail(saved);
    }

    private boolean isBlank(String s) { return s == null || s.isBlank(); }

    // ═══════════════════════════════════════════════════════════════════
    //  DTO mappers — kept package-visible so AdoptionReviewService reuses
    // ═══════════════════════════════════════════════════════════════════

    Detail toDetail(AdoptionApplication a) {
        User adopter = userRepo.findById(a.getAdopterId()).orElse(null);
        AdoptablePet pet = petRepo.findById(a.getAdoptablePetId()).orElse(null);
        Ngo ngo = a.getNgoId() != null ? ngoRepo.findById(a.getNgoId()).orElse(null) : null;

        List<DocumentResponse> docs = docRepo
                .findByApplicationIdOrderByUploadedAtDesc(a.getId()).stream()
                .map(kycService::toResponse).toList();

        List<StatusHistoryEntry> history = auditService
                .history(AuditTargetType.APPLICATION, a.getId()).stream()
                .sorted(Comparator.comparing(AdoptionAuditLog::getPerformedAt))
                .map(log -> StatusHistoryEntry.builder()
                        .action(log.getAction())
                        .reason(log.getReason())
                        .actorId(log.getActorId())
                        .performedAt(log.getPerformedAt())
                        .build())
                .collect(Collectors.toList());

        return Detail.builder()
                .id(a.getId())
                .adopterId(a.getAdopterId())
                .adopterName(adopter != null ? adopter.getFullName() : null)
                .adopterPhone(adopter != null ? adopter.getPhone() : null)
                .adopterEmail(adopter != null ? adopter.getEmail() : null)
                .adoptablePetId(a.getAdoptablePetId())
                .petName(pet != null ? pet.getName() : null)
                .ngoId(a.getNgoId())
                .ngoName(ngo != null ? ngo.getName() : null)
                .status(a.getStatus() != null ? a.getStatus().name() : null)
                .currentStep(a.getCurrentStep() != null ? a.getCurrentStep().name() : null)
                .personal(PersonalSection.builder()
                        .fullName(a.getFullName())
                        .phone(a.getPhone())
                        .email(a.getEmail())
                        .addressLine(a.getAddressLine())
                        .city(a.getCity())
                        .pincode(a.getPincode())
                        .build())
                .lifestyle(LifestyleSection.builder()
                        .housingType(a.getHousingType())
                        .hasYard(a.getHasYard())
                        .otherPetsCount(a.getOtherPetsCount())
                        .workScheduleHours(a.getWorkScheduleHours())
                        .build())
                .experience(ExperienceSection.builder()
                        .prevPetOwnership(a.getPrevPetOwnership())
                        .prevPetDetails(a.getPrevPetDetails())
                        .vetSupport(a.getVetSupport())
                        .build())
                .consent(ConsentSection.builder()
                        .consentHomeVisit(a.getConsentHomeVisit())
                        .consentFollowUp(a.getConsentFollowUp())
                        .consentBackgroundCheck(a.getConsentBackgroundCheck())
                        .build())
                .decisionReason(a.getDecisionReason())
                .clarificationQuestions(a.getClarificationQuestions())
                .documents(docs)
                .history(history)
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .lastActivityAt(a.getLastActivityAt())
                .submittedAt(a.getSubmittedAt())
                .decidedAt(a.getDecidedAt())
                .build();
    }

    Summary toSummary(AdoptionApplication a) {
        User adopter = userRepo.findById(a.getAdopterId()).orElse(null);
        AdoptablePet pet = petRepo.findById(a.getAdoptablePetId()).orElse(null);
        long pending = docRepo.countByApplicationIdAndVerificationStatus(
                a.getId(), com.cts.mfrp.petzbackend.adoption.enums.KycVerificationStatus.PENDING);
        return Summary.builder()
                .id(a.getId())
                .adopterId(a.getAdopterId())
                .adopterName(adopter != null ? adopter.getFullName() : null)
                .adoptablePetId(a.getAdoptablePetId())
                .petName(pet != null ? pet.getName() : null)
                .ngoId(a.getNgoId())
                .status(a.getStatus() != null ? a.getStatus().name() : null)
                .currentStep(a.getCurrentStep() != null ? a.getCurrentStep().name() : null)
                .submittedAt(a.getSubmittedAt())
                .lastActivityAt(a.getLastActivityAt())
                .pendingDocCount(pending)
                .build();
    }
}
