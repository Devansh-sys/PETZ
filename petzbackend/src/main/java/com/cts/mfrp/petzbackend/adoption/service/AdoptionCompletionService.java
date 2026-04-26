package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionCompletionDtos.AdoptionResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionCompletionDtos.ScheduleHandoverRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionFollowUpDtos.FollowUpResponse;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptablePetStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptionApplicationStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptionStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.enums.FollowUpStatus;
import com.cts.mfrp.petzbackend.adoption.enums.FollowUpType;
import com.cts.mfrp.petzbackend.adoption.model.AdoptablePet;
import com.cts.mfrp.petzbackend.adoption.model.Adoption;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionApplication;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionFollowUp;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptablePetRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionApplicationRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionFollowUpRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionRepository;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.common.service.NotificationService;
import com.cts.mfrp.petzbackend.hospital.model.Pet;
import com.cts.mfrp.petzbackend.hospital.repository.PetRepository;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Epic 2.5 — handover scheduling + finalization + hospital bridge.
 *
 *   US-2.5.1  scheduleHandover(applicationId, date, location)
 *              → Adoption{HANDOVER_SCHEDULED}; both parties notified.
 *   US-2.5.2  confirmHandover(id) → flips to COMPLETED; record IMMUTABLE.
 *   US-2.5.3  Also creates 3 AdoptionFollowUp rows (+7 / +30 / +90 days).
 *   US-2.5.5  Also INSERTs a hospital `Pet` row for the adopter so they
 *              can book hospital appointments immediately via Epic 3.4
 *              endpoints — zero code changes to the hospital module.
 *
 * Immutability is enforced at the service layer (no post-COMPLETED
 * mutator paths exist). The {@link AdoptionRepository} row is conceptually
 * read-only after finalization.
 */
@Service
@RequiredArgsConstructor
public class AdoptionCompletionService {

    private static final Logger log = LoggerFactory.getLogger(AdoptionCompletionService.class);

    private final AdoptionApplicationRepository appRepo;
    private final AdoptablePetRepository        petRepo;
    private final AdoptionRepository            adoptionRepo;
    private final AdoptionFollowUpRepository    followUpRepo;
    private final NgoRepository                 ngoRepo;
    private final UserRepository                userRepo;
    private final PetRepository                 hospitalPetRepo;         // bridge target
    private final AdoptionAuditService          auditService;
    private final NotificationService           notifications;

    // ═════════════════════════════════════════════════════════════════
    //  US-2.5.1 — Schedule handover
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public AdoptionResponse scheduleHandover(UUID reviewerId, UUID callerNgoId,
                                             ScheduleHandoverRequest req) {
        AdoptionApplication app = appRepo.findById(req.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AdoptionApplication", req.getApplicationId()));

        requireNgoOwnership(app.getNgoId(), callerNgoId);

        if (app.getStatus() != AdoptionApplicationStatus.APPROVED) {
            throw new IllegalStateException(
                    "Only APPROVED applications can be scheduled for handover (current="
                            + app.getStatus() + ").");
        }
        adoptionRepo.findByApplicationId(app.getId()).ifPresent(existing -> {
            throw new IllegalStateException(
                    "An adoption record already exists for this application ("
                            + existing.getStatus() + ").");
        });

        Adoption adoption = Adoption.builder()
                .applicationId(app.getId())
                .adopterId(app.getAdopterId())
                .ngoId(app.getNgoId())
                .adoptablePetId(app.getAdoptablePetId())
                .status(AdoptionStatus.HANDOVER_SCHEDULED)
                .handoverDate(req.getHandoverDate())
                .handoverLocation(req.getHandoverLocation())
                .build();
        Adoption saved = adoptionRepo.save(adoption);

        auditService.log(AuditTargetType.ADOPTION, saved.getId(), reviewerId,
                "HANDOVER_SCHEDULED", req.getHandoverLocation(),
                "{\"applicationId\":\"" + app.getId() + "\",\"handoverDate\":\""
                        + req.getHandoverDate() + "\"}");

        String details = "Handover on " + req.getHandoverDate()
                + " at " + req.getHandoverLocation();
        notifications.notifyAdopterHandoverScheduled(app.getAdopterId(), saved.getId(), details);
        notifications.notifyNgoHandoverScheduled(app.getNgoId(), saved.getId(), details);

        log.info("Adoption {} HANDOVER_SCHEDULED for application {} by reviewer {}",
                saved.getId(), app.getId(), reviewerId);
        return toResponse(saved, List.of());
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.5.2 + US-2.5.3 + US-2.5.5 — Confirm handover
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public AdoptionResponse confirmHandover(UUID reviewerId, UUID callerNgoId,
                                            UUID adoptionId) {
        Adoption adoption = loadForNgo(adoptionId, callerNgoId);

        if (adoption.getStatus() == AdoptionStatus.COMPLETED) {
            // Idempotent — but US-2.5.2 says no further edits; so re-confirm
            // returns the existing state, no audit spam.
            return toResponse(adoption,
                    followUpRepo.findByAdoptionIdOrderByDueDateAsc(adoptionId));
        }

        // 1. Flip to COMPLETED (immutable from now on).
        LocalDateTime now = LocalDateTime.now();
        adoption.setStatus(AdoptionStatus.COMPLETED);
        adoption.setFinalizedAt(now);

        // 2. Flip the AdoptablePet to ADOPTED.
        AdoptablePet pet = petRepo.findById(adoption.getAdoptablePetId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AdoptablePet", adoption.getAdoptablePetId()));
        pet.setStatus(AdoptablePetStatus.ADOPTED);
        petRepo.save(pet);

        // 3. US-2.5.5 — bridge to hospital module by creating a new
        //    hospital `Pet` row owned by the adopter.
        Pet hospitalPet = Pet.builder()
                .userId(adoption.getAdopterId())
                .name(pet.getName())
                .species(pet.getSpecies())
                .breed(pet.getBreed())
                .dateOfBirth(computeDateOfBirth(pet.getAgeMonths()))
                .build();
        Pet savedHospitalPet = hospitalPetRepo.save(hospitalPet);
        adoption.setHospitalPetId(savedHospitalPet.getId());

        // 4. Persist the Adoption record with hospitalPetId.
        Adoption finalizedAdoption = adoptionRepo.save(adoption);

        // 5. US-2.5.3 — three auto-scheduled follow-ups.
        List<AdoptionFollowUp> follows = createFollowUps(finalizedAdoption);

        auditService.log(AuditTargetType.ADOPTION, finalizedAdoption.getId(), reviewerId,
                "HANDOVER_CONFIRMED", null,
                "{\"hospitalPetId\":\"" + savedHospitalPet.getId() + "\"}");

        notifications.notifyHospitalModuleLinked(
                finalizedAdoption.getAdopterId(),
                finalizedAdoption.getId(),
                savedHospitalPet.getId());

        log.info("Adoption {} COMPLETED; hospital Pet {} created for adopter {}",
                finalizedAdoption.getId(), savedHospitalPet.getId(),
                finalizedAdoption.getAdopterId());
        return toResponse(finalizedAdoption, follows);
    }

    // ═════════════════════════════════════════════════════════════════
    //  Read endpoints
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<AdoptionResponse> listForAdopter(UUID adopterId) {
        List<Adoption> rows = adoptionRepo.findByAdopterIdOrderByCreatedAtDesc(adopterId);
        return rows.stream()
                .map(a -> toResponse(a, followUpRepo.findByAdoptionIdOrderByDueDateAsc(a.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdoptionResponse> listForNgo(UUID ngoId) {
        requireNgoOwnership(ngoId, ngoId);
        List<Adoption> rows = adoptionRepo.findByNgoIdOrderByCreatedAtDesc(ngoId);
        return rows.stream()
                .map(a -> toResponse(a, followUpRepo.findByAdoptionIdOrderByDueDateAsc(a.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdoptionResponse getById(UUID adoptionId) {
        Adoption a = adoptionRepo.findById(adoptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Adoption", adoptionId));
        return toResponse(a, followUpRepo.findByAdoptionIdOrderByDueDateAsc(a.getId()));
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

    private void requireNgoOwnership(UUID applicationNgoId, UUID callerNgoId) {
        if (callerNgoId == null) {
            throw new IllegalArgumentException(
                    "Caller is not bound to an NGO. Seed users.ngo_id first.");
        }
        if (!callerNgoId.equals(applicationNgoId)) {
            throw new ResourceNotFoundException(
                    "Application does not belong to your NGO.");
        }
    }

    private List<AdoptionFollowUp> createFollowUps(Adoption adoption) {
        LocalDate base = adoption.getHandoverDate() != null
                ? adoption.getHandoverDate()
                : adoption.getFinalizedAt().toLocalDate();
        List<AdoptionFollowUp> rows = new ArrayList<>();
        for (FollowUpType type : FollowUpType.values()) {
            AdoptionFollowUp row = AdoptionFollowUp.builder()
                    .adoptionId(adoption.getId())
                    .followUpType(type)
                    .dueDate(base.plusDays(type.getOffsetDays()))
                    .status(FollowUpStatus.SCHEDULED)
                    .concernFlag(false)
                    .build();
            rows.add(followUpRepo.save(row));
        }
        return rows;
    }

    /**
     * Fallback dateOfBirth synthesis for the hospital Pet row. AdoptablePet
     * stores {@code ageMonths} (not a birth date); hospital Pet wants
     * {@code dateOfBirth}. When ageMonths is null, we leave DOB null.
     */
    private LocalDate computeDateOfBirth(Integer ageMonths) {
        if (ageMonths == null || ageMonths < 0) return null;
        return LocalDate.now().minusMonths(ageMonths);
    }

    private AdoptionResponse toResponse(Adoption a, List<AdoptionFollowUp> follows) {
        User adopter = userRepo.findById(a.getAdopterId()).orElse(null);
        Ngo ngo = ngoRepo.findById(a.getNgoId()).orElse(null);
        AdoptablePet pet = petRepo.findById(a.getAdoptablePetId()).orElse(null);

        List<FollowUpResponse> followDtos = follows == null ? List.of() :
                follows.stream().map(f -> FollowUpResponse.builder()
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
                        .build())
                        .toList();

        return AdoptionResponse.builder()
                .id(a.getId())
                .applicationId(a.getApplicationId())
                .adopterId(a.getAdopterId())
                .adopterName(adopter != null ? adopter.getFullName() : null)
                .ngoId(a.getNgoId())
                .ngoName(ngo != null ? ngo.getName() : null)
                .adoptablePetId(a.getAdoptablePetId())
                .petName(pet != null ? pet.getName() : null)
                .hospitalPetId(a.getHospitalPetId())
                .status(a.getStatus() != null ? a.getStatus().name() : null)
                .handoverDate(a.getHandoverDate())
                .handoverLocation(a.getHandoverLocation())
                .finalizedAt(a.getFinalizedAt())
                .createdAt(a.getCreatedAt())
                .followUps(followDtos)
                .build();
    }
}
