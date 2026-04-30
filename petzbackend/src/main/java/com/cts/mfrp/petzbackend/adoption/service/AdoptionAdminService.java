package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.AddNgoRepresentativeRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.ApplicationDecideRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.ApplicationSummary;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.CreateNgoWithRepRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.MetricsResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.NgoAdminPetSummary;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.NgoResponse;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionAdminDtos.VerifyNgoRequest;
import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptablePetStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptionApplicationStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptionStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.enums.FollowUpStatus;
import com.cts.mfrp.petzbackend.adoption.model.AdoptablePet;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionApplication;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptablePetRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionApplicationRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionFollowUpRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionRepository;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import com.cts.mfrp.petzbackend.notification.enums.NotificationType;
import com.cts.mfrp.petzbackend.notification.service.InAppNotificationService;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Epic 2.6 — admin-level oversight.
 *
 *   US-2.6.1 computeMetrics(from, to, ngoId, city)
 *   US-2.6.2 listPendingNgos / verifyNgo(action, reason, ownerUserId)
 *
 * Dispute handling lives in {@code AdoptionDisputeService} (separate class
 * to keep each service focused).
 */
@Service
@RequiredArgsConstructor
public class AdoptionAdminService {

    private static final Logger log = LoggerFactory.getLogger(AdoptionAdminService.class);
    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private final AdoptionApplicationRepository appRepo;
    private final AdoptionRepository            adoptionRepo;
    private final AdoptionFollowUpRepository    followUpRepo;
    private final NgoRepository                 ngoRepo;
    private final UserRepository                userRepo;
    private final AdoptablePetRepository        petRepo;
    private final AdoptionAuditService          auditService;
    private final InAppNotificationService      notificationService;

    // ═════════════════════════════════════════════════════════════════
    //  US-2.6.1 — Metrics dashboard
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public MetricsResponse computeMetrics(LocalDate from, LocalDate to,
                                          UUID ngoId, String city) {
        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt   = to   != null ? to.plusDays(1).atStartOfDay() : null;

        Specification<AdoptionApplication> spec = (root, q, cb) -> {
            Predicate p = cb.conjunction();
            if (ngoId != null) p = cb.and(p, cb.equal(root.get("ngoId"), ngoId));
            if (fromDt != null) p = cb.and(p, cb.greaterThanOrEqualTo(root.get("createdAt"), fromDt));
            if (toDt   != null) p = cb.and(p, cb.lessThan(root.get("createdAt"), toDt));
            return p;
        };
        List<AdoptionApplication> apps = appRepo.findAll(spec);

        if (city != null && !city.isBlank()) {
            // Filter by city — joins AdoptablePet via petId. Simple in-memory
            // filter since the dataset is small and beginner-friendly.
            apps = apps.stream()
                    // placeholder — AdoptablePet.locationCity lookup would need
                    // an extra repo; we keep the query shape below simple and
                    // use the counting helper on AdoptionRepository for the
                    // completed-adoption slice.
                    .collect(Collectors.toList());
        }

        long total      = apps.size();
        long submitted  = apps.stream().filter(a -> a.getStatus() != AdoptionApplicationStatus.DRAFT).count();
        long approved   = apps.stream().filter(a -> a.getStatus() == AdoptionApplicationStatus.APPROVED).count();
        long rejected   = apps.stream().filter(a -> a.getStatus() == AdoptionApplicationStatus.REJECTED).count();
        long withdrawn  = apps.stream().filter(a -> a.getStatus() == AdoptionApplicationStatus.WITHDRAWN).count();

        long completed = (ngoId != null)
                ? adoptionRepo.countByNgoIdAndStatus(ngoId, AdoptionStatus.COMPLETED)
                : (city != null && !city.isBlank())
                    ? adoptionRepo.countByStatusAndCity(AdoptionStatus.COMPLETED, city)
                    : adoptionRepo.countByStatus(AdoptionStatus.COMPLETED);

        double conversion = submitted == 0 ? 0.0
                : round((approved * 100.0) / submitted);
        double completionRate = approved == 0 ? 0.0
                : round((completed * 100.0) / approved);

        // Avg review time: decidedAt - submittedAt on apps with a decision
        java.util.OptionalDouble avgMinutes = apps.stream()
                .filter(a -> a.getSubmittedAt() != null && a.getDecidedAt() != null)
                .mapToLong(a -> Duration.between(a.getSubmittedAt(),
                        a.getDecidedAt()).toMinutes())
                .average();
        Double avgReviewHours = avgMinutes.isPresent()
                ? round(avgMinutes.getAsDouble() / 60.0)
                : null;

        // Follow-up compliance
        long totalFollow = followUpRepo.count();
        long completedFollow = followUpRepo.countByStatus(FollowUpStatus.COMPLETED);
        long flaggedFollow   = followUpRepo.countByStatus(FollowUpStatus.FLAGGED);
        long dueByNow = followUpRepo.countByStatusAndDueDateLessThanEqual(
                FollowUpStatus.SCHEDULED, LocalDate.now()) + completedFollow + flaggedFollow;
        double compliance = dueByNow == 0 ? 100.0
                : round((completedFollow * 100.0) / dueByNow);

        return MetricsResponse.builder()
                .totalApplications(total)
                .approvedCount(approved)
                .rejectedCount(rejected)
                .withdrawnCount(withdrawn)
                .completedAdoptions(completed)
                .conversionRatePercent(conversion)
                .completionRatePercent(completionRate)
                .avgReviewTimeHours(avgReviewHours)
                .followUpCompliancePercent(compliance)
                .totalFollowUps(totalFollow)
                .completedFollowUps(completedFollow)
                .flaggedFollowUps(flaggedFollow)
                .build();
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.6.2 — NGO verification
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<NgoResponse> listNgos(Boolean verifiedFilter) {
        List<Ngo> rows = ngoRepo.findAll();
        return rows.stream()
                .filter(n -> verifiedFilter == null || n.isVerified() == verifiedFilter)
                .map(this::toNgoResponse)
                .toList();
    }

    @Transactional
    public NgoResponse verifyNgo(UUID adminId, UUID ngoId, VerifyNgoRequest req) {
        Ngo ngo = ngoRepo.findById(ngoId)
                .orElseThrow(() -> new ResourceNotFoundException("Ngo", ngoId));

        String action = req.getAction().trim().toUpperCase();
        String auditAction;
        switch (action) {
            case "APPROVE" -> {
                ngo.setVerified(true);
                ngo.setActive(true);
                auditAction = "NGO_APPROVED";
            }
            case "REJECT" -> {
                ngo.setVerified(false);
                ngo.setActive(false);
                auditAction = "NGO_REJECTED";
            }
            case "SUSPEND" -> {
                ngo.setActive(false);
                auditAction = "NGO_SUSPENDED";
            }
            default -> throw new IllegalArgumentException(
                    "Invalid action '" + req.getAction()
                            + "'. Allowed: APPROVE, REJECT, SUSPEND");
        }
        if (req.getOwnerUserId() != null) {
            User owner = userRepo.findById(req.getOwnerUserId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User", req.getOwnerUserId()));
            ngo.setOwnerUserId(owner.getId());
            // Also link the user back to the NGO (so ngoId-derived auth works).
            owner.setNgoId(ngo.getId());
            userRepo.save(owner);
        }
        Ngo saved = ngoRepo.save(ngo);

        auditService.log(AuditTargetType.NGO, saved.getId(), adminId,
                auditAction, req.getReason(),
                req.getOwnerUserId() != null
                        ? "{\"ownerUserId\":\"" + req.getOwnerUserId() + "\"}"
                        : null);

        log.info("NGO {} {} by admin {}", saved.getId(), auditAction, adminId);
        return toNgoResponse(saved);
    }

    // ═════════════════════════════════════════════════════════════════
    //  Admin: list all adoption applications platform-wide
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public PageResponse<ApplicationSummary> listAllApplications(String status, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdoptionApplication> result;
        if (status != null && !status.isBlank()) {
            AdoptionApplicationStatus statusEnum = AdoptionApplicationStatus.valueOf(status.toUpperCase());
            Specification<AdoptionApplication> spec = (root, q, cb) ->
                    cb.equal(root.get("status"), statusEnum);
            result = appRepo.findAll(spec, pageRequest);
        } else {
            result = appRepo.findAll(pageRequest);
        }
        return PageResponse.from(result, this::toApplicationSummary);
    }

    // ═════════════════════════════════════════════════════════════════
    //  Admin: NGO-wise pet listings
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public PageResponse<NgoAdminPetSummary> getNgoPets(UUID ngoId, String status, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<AdoptablePet> result;
        if (status != null && !status.isBlank()) {
            AdoptablePetStatus petStatus = AdoptablePetStatus.valueOf(status.toUpperCase());
            Specification<AdoptablePet> spec = (root, q, cb) ->
                    cb.and(cb.equal(root.get("ngoId"), ngoId), cb.equal(root.get("status"), petStatus));
            result = petRepo.findAll(spec, pageRequest);
        } else {
            result = petRepo.findByNgoId(ngoId, pageRequest);
        }
        return PageResponse.from(result, this::toPetSummary);
    }

    // ═════════════════════════════════════════════════════════════════
    //  Admin: create NGO + representative in one step
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public NgoResponse createNgoWithRep(UUID adminId, CreateNgoWithRepRequest req) {
        Ngo ngo = new Ngo();
        ngo.setName(req.getNgoName().trim());
        ngo.setAddress(req.getNgoAddress());
        ngo.setContactPhone(req.getNgoContactPhone());
        ngo.setContactEmail(req.getNgoContactEmail());
        ngo.setRegistrationNumber(req.getNgoRegistrationNumber());
        ngo.setLatitude(req.getLatitude());
        ngo.setLongitude(req.getLongitude());
        ngo.setActive(true);
        ngo.setVerified(true);
        Ngo savedNgo = ngoRepo.save(ngo);

        User rep = new User();
        rep.setFullName(req.getRepFullName());
        rep.setPhone(req.getRepPhone());
        rep.setEmail(req.getRepEmail());
        rep.setPasswordHash(ENCODER.encode(req.getRepPassword()));
        rep.setRole(User.Role.NGO_REP);
        rep.setNgoId(savedNgo.getId());
        rep.setActive(true);
        rep.setEmailVerified(false);
        rep.setPhoneVerified(false);
        rep.setFailedLoginAttempts(0);
        User savedRep = userRepo.save(rep);

        savedNgo.setOwnerUserId(savedRep.getId());
        ngoRepo.save(savedNgo);

        auditService.log(AuditTargetType.NGO, savedNgo.getId(), adminId,
                "NGO_CREATED_WITH_REP", "Created by admin with rep: " + req.getRepFullName(), null);
        log.info("Admin {} created NGO {} with rep {}", adminId, savedNgo.getId(), savedRep.getId());
        return toNgoResponse(savedNgo);
    }

    // ═════════════════════════════════════════════════════════════════
    //  Admin: direct approve / reject (overrides NGO decision)
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public ApplicationSummary adminDecide(UUID adminId, UUID applicationId,
                                          ApplicationDecideRequest req) {
        AdoptionApplication app = appRepo.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("AdoptionApplication", applicationId));

        String action = req.getAction().trim().toUpperCase();
        AdoptionApplicationStatus newStatus = switch (action) {
            case "APPROVE" -> AdoptionApplicationStatus.APPROVED;
            case "REJECT"  -> AdoptionApplicationStatus.REJECTED;
            default -> throw new IllegalArgumentException(
                    "Invalid action '" + req.getAction() + "'. Allowed: APPROVE, REJECT");
        };

        app.setStatus(newStatus);
        app.setDecidedAt(LocalDateTime.now());
        app.setDecisionReason(req.getReason());
        app.setLastActivityAt(LocalDateTime.now());
        appRepo.save(app);

        String title = "APPROVE".equals(action) ? "Adoption Application Approved 🐾" : "Adoption Application Update";
        String body  = "APPROVE".equals(action)
                ? "Congratulations! Your adoption application has been approved by the platform administrator."
                : "Your adoption application was reviewed by admin. " +
                  (req.getReason() != null ? "Reason: " + req.getReason() : "");
        try {
            notificationService.create(app.getAdopterId(), NotificationType.ADOPTION_DECISION,
                    title, body, applicationId, "ADOPTION_APPLICATION");
        } catch (Exception ex) {
            log.warn("Notification failed for application {}: {}", applicationId, ex.getMessage());
        }

        auditService.log(AuditTargetType.APPLICATION, applicationId, adminId,
                "ADMIN_" + action, req.getReason(), null);
        log.info("Admin {} {} application {}", adminId, action, applicationId);
        return toApplicationSummary(app);
    }

    // ═════════════════════════════════════════════════════════════════
    //  Admin: create NGO representative user
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public NgoResponse addNgoRepresentative(UUID adminId, UUID ngoId,
                                             AddNgoRepresentativeRequest req) {
        Ngo ngo = ngoRepo.findById(ngoId)
                .orElseThrow(() -> new ResourceNotFoundException("Ngo", ngoId));

        User user = new User();
        user.setFullName(req.getFullName());
        user.setPhone(req.getPhone());
        user.setEmail(req.getEmail());
        user.setPasswordHash(ENCODER.encode(req.getPassword()));
        user.setRole(User.Role.NGO_REP);
        user.setNgoId(ngoId);
        user.setActive(true);
        user.setEmailVerified(false);
        user.setPhoneVerified(false);
        user.setFailedLoginAttempts(0);
        userRepo.save(user);

        ngo.setOwnerUserId(user.getId());
        ngoRepo.save(ngo);

        auditService.log(AuditTargetType.NGO, ngoId, adminId,
                "NGO_REP_ADDED", "Added: " + req.getFullName(), null);
        log.info("Admin {} added NGO rep {} to NGO {}", adminId, user.getId(), ngoId);
        return toNgoResponse(ngo);
    }

    // ─── helpers ─────────────────────────────────────────────────────

    private ApplicationSummary toApplicationSummary(AdoptionApplication app) {
        String ngoName = ngoRepo.findById(app.getNgoId()).map(Ngo::getName).orElse(null);
        return ApplicationSummary.builder()
                .id(app.getId())
                .adopterId(app.getAdopterId())
                .adoptablePetId(app.getAdoptablePetId())
                .ngoId(app.getNgoId())
                .ngoName(ngoName)
                .status(app.getStatus())
                .fullName(app.getFullName())
                .phone(app.getPhone())
                .email(app.getEmail())
                .city(app.getCity())
                .housingType(app.getHousingType())
                .prevPetOwnership(app.getPrevPetOwnership())
                .consentHomeVisit(app.getConsentHomeVisit())
                .consentFollowUp(app.getConsentFollowUp())
                .consentBackgroundCheck(app.getConsentBackgroundCheck())
                .decisionReason(app.getDecisionReason())
                .submittedAt(app.getSubmittedAt())
                .createdAt(app.getCreatedAt())
                .decidedAt(app.getDecidedAt())
                .build();
    }

    private NgoResponse toNgoResponse(Ngo n) {
        long total   = petRepo.countByNgoId(n.getId());
        long listed  = petRepo.countByNgoIdAndStatus(n.getId(), AdoptablePetStatus.LISTED);
        long adopted = petRepo.countByNgoIdAndStatus(n.getId(), AdoptablePetStatus.ADOPTED);
        long onHold  = petRepo.countByNgoIdAndStatus(n.getId(), AdoptablePetStatus.ON_HOLD);

        NgoResponse.NgoResponseBuilder builder = NgoResponse.builder()
                .id(n.getId())
                .name(n.getName())
                .latitude(n.getLatitude())
                .longitude(n.getLongitude())
                .active(n.isActive())
                .isVerified(n.isVerified())
                .ownerUserId(n.getOwnerUserId())
                .contactPhone(n.getContactPhone())
                .contactEmail(n.getContactEmail())
                .registrationNumber(n.getRegistrationNumber())
                .address(n.getAddress())
                .totalPets(total)
                .listedPets(listed)
                .adoptedPets(adopted)
                .onHoldPets(onHold);

        if (n.getOwnerUserId() != null) {
            userRepo.findById(n.getOwnerUserId()).ifPresent(u -> {
                builder.repFullName(u.getFullName());
                builder.repPhone(u.getPhone());
                builder.repEmail(u.getEmail());
            });
        }

        return builder.build();
    }

    private NgoAdminPetSummary toPetSummary(AdoptablePet p) {
        return NgoAdminPetSummary.builder()
                .id(p.getId())
                .name(p.getName())
                .species(p.getSpecies())
                .breed(p.getBreed())
                .gender(p.getGender())
                .ageMonths(p.getAgeMonths())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .locationCity(p.getLocationCity())
                .isAdoptionReady(p.isAdoptionReady())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private static double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
