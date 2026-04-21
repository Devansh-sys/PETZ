package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.CreateRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.Detail;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.FilterRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.Summary;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.UpdateRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptionMediaDtos.MediaResponse;
import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptablePetStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptionApplicationStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.model.AdoptablePet;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionApplication;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionMedia;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptablePetRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionApplicationRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionMediaRepository;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.cts.mfrp.petzbackend.adoption.service.AdoptablePetSpecifications.*;

/**
 * Epic 2.1 + 2.2 — pet-listing business logic.
 *
 *   US-2.1.1 browseListed (paginated)
 *   US-2.1.2 search (multi-select filters)
 *   US-2.1.3 sort = newest | nearest | ready
 *   US-2.1.4 getDetail (profile + media + NGO info)
 *   US-2.2.1 createListing
 *   US-2.2.2 updateListing (+ audit)
 *   US-2.2.4 archiveListing
 */
@Service
@RequiredArgsConstructor
public class AdoptablePetService {

    private static final Logger log = LoggerFactory.getLogger(AdoptablePetService.class);

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE     = 100;

    private final AdoptablePetRepository          petRepo;
    private final AdoptionMediaRepository         mediaRepo;
    private final NgoRepository                   ngoRepo;
    private final AdoptionAuditService            auditService;
    private final AdoptionApplicationRepository  applicationRepo;

    // ═════════════════════════════════════════════════════════════════
    //  US-2.1.1 + US-2.1.2 + US-2.1.3  — Public browse / filter / sort
    // ═════════════════════════════════════════════════════════════════

    /**
     * Public discovery endpoint. Always filters to {@code status=LISTED}
     * (archived / on-hold / adopted pets are hidden from the catalog —
     * US-2.1.1 AC#3 "real-time availability"). Pass {@code lat}/{@code lon}
     * to enable the "nearest" sort.
     */
    @Transactional(readOnly = true)
    public PageResponse<Summary> browse(FilterRequest filter,
                                        String sort,
                                        Double lat,
                                        Double lon,
                                        int page,
                                        int size) {
        Specification<AdoptablePet> spec = buildSpec(filter, AdoptablePetStatus.LISTED, null);

        if ("nearest".equalsIgnoreCase(sort) && lat != null && lon != null) {
            // Geo-aware: pull all matches, sort by haversine, slice in-memory.
            // Fine for this codebase's dataset size; document trade-off for
            // future scalability review.
            List<AdoptablePet> all = petRepo.findAll(spec);
            List<AdoptablePet> sorted = all.stream()
                    .sorted(Comparator.comparingDouble(p ->
                            distanceKm(lat, lon, p.getLatitude(), p.getLongitude())))
                    .toList();
            return paginateInMemory(sorted, page, size, lat, lon);
        }

        Pageable pageable = PageRequest.of(clampPage(page), clampSize(size),
                buildDbSort(sort));
        Page<AdoptablePet> pageResult = petRepo.findAll(spec, pageable);
        Map<UUID, String> ngoNames = fetchNgoNames(
                pageResult.getContent().stream().map(AdoptablePet::getNgoId).toList());
        Map<UUID, AdoptionMedia> primary = fetchPrimaryMedia(
                pageResult.getContent().stream().map(AdoptablePet::getId).toList());

        return PageResponse.from(pageResult, p -> toSummary(p,
                ngoNames.get(p.getNgoId()), primary.get(p.getId()), lat, lon));
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.1.4  — View full profile
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Detail getDetail(UUID petId) {
        AdoptablePet pet = petRepo.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("AdoptablePet", petId));
        Ngo ngo = ngoRepo.findById(pet.getNgoId()).orElse(null);
        List<AdoptionMedia> media = mediaRepo
                .findByAdoptablePetIdOrderByDisplayOrderAsc(petId);
        return toDetail(pet, ngo, media);
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.2.1  — Create listing (NGO)
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail createListing(UUID actingUserId, UUID callerNgoId, CreateRequest req) {
        UUID ngoId = resolveNgoId(callerNgoId, req.getNgoId());
        ensureNgoExists(ngoId);

        AdoptablePet pet = AdoptablePet.builder()
                .ngoId(ngoId)
                .name(req.getName())
                .species(req.getSpecies())
                .breed(req.getBreed())
                .gender(req.getGender())
                .ageMonths(req.getAgeMonths())
                .sizeCategory(req.getSizeCategory())
                .color(req.getColor())
                .description(req.getDescription())
                .temperament(req.getTemperament())
                .medicalSummary(req.getMedicalSummary())
                .vaccinationStatus(req.getVaccinationStatus())
                .specialNeeds(Boolean.TRUE.equals(req.getSpecialNeeds()))
                .specialNeedsNotes(req.getSpecialNeedsNotes())
                .locationCity(req.getLocationCity())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .isAdoptionReady(Boolean.TRUE.equals(req.getIsAdoptionReady()))
                .status(AdoptablePetStatus.LISTED)   // AC#3 "Published upon creation"
                .build();
        AdoptablePet saved = petRepo.save(pet);

        auditService.log(AuditTargetType.PET_LISTING, saved.getId(), actingUserId,
                "LISTING_CREATED", null,
                "{\"ngoId\":\"" + ngoId + "\",\"name\":\"" + safe(saved.getName()) + "\"}");

        log.info("AdoptablePet {} created by user {} for NGO {}",
                saved.getId(), actingUserId, ngoId);

        return toDetail(saved, ngoRepo.findById(ngoId).orElse(null), List.of());
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.2.2  — Update listing (NGO) + audit
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail updateListing(UUID actingUserId, UUID callerNgoId,
                                UUID petId, UpdateRequest req) {
        AdoptablePet pet = loadForMutation(petId, callerNgoId);
        StringBuilder changed = new StringBuilder("{");

        if (req.getName() != null)              apply(changed, "name",              pet::setName,              req.getName());
        if (req.getSpecies() != null)           apply(changed, "species",           pet::setSpecies,           req.getSpecies());
        if (req.getBreed() != null)             apply(changed, "breed",             pet::setBreed,             req.getBreed());
        if (req.getGender() != null)            apply(changed, "gender",            pet::setGender,            req.getGender());
        if (req.getAgeMonths() != null)         apply(changed, "ageMonths",         pet::setAgeMonths,         req.getAgeMonths());
        if (req.getSizeCategory() != null)      apply(changed, "sizeCategory",      pet::setSizeCategory,      req.getSizeCategory());
        if (req.getColor() != null)             apply(changed, "color",             pet::setColor,             req.getColor());
        if (req.getDescription() != null)       apply(changed, "description",       pet::setDescription,       req.getDescription());
        if (req.getTemperament() != null)       apply(changed, "temperament",       pet::setTemperament,       req.getTemperament());
        if (req.getMedicalSummary() != null)    apply(changed, "medicalSummary",    pet::setMedicalSummary,    req.getMedicalSummary());
        if (req.getVaccinationStatus() != null) apply(changed, "vaccinationStatus", pet::setVaccinationStatus, req.getVaccinationStatus());
        if (req.getSpecialNeeds() != null)      apply(changed, "specialNeeds",      pet::setSpecialNeeds,      req.getSpecialNeeds());
        if (req.getSpecialNeedsNotes() != null) apply(changed, "specialNeedsNotes", pet::setSpecialNeedsNotes, req.getSpecialNeedsNotes());
        if (req.getLocationCity() != null)      apply(changed, "locationCity",      pet::setLocationCity,      req.getLocationCity());
        if (req.getLatitude() != null)          apply(changed, "latitude",          pet::setLatitude,          req.getLatitude());
        if (req.getLongitude() != null)         apply(changed, "longitude",         pet::setLongitude,         req.getLongitude());
        if (req.getIsAdoptionReady() != null)   apply(changed, "isAdoptionReady",   pet::setAdoptionReady,     req.getIsAdoptionReady());

        if (req.getStatus() != null) {
            AdoptablePetStatus next = parseStatus(req.getStatus());
            guardStatusTransition(pet.getStatus(), next);
            apply(changed, "status", pet::setStatus, next);
        }

        AdoptablePet saved = petRepo.save(pet);
        if (changed.length() > 1) changed.setCharAt(changed.length() - 1, '}');
        else                      changed.append("}");

        auditService.log(AuditTargetType.PET_LISTING, saved.getId(), actingUserId,
                "LISTING_UPDATED", null, changed.toString());

        return toDetail(saved, ngoRepo.findById(saved.getNgoId()).orElse(null),
                mediaRepo.findByAdoptablePetIdOrderByDisplayOrderAsc(saved.getId()));
    }

    // ═════════════════════════════════════════════════════════════════
    //  US-2.2.4  — Archive listing
    // ═════════════════════════════════════════════════════════════════

    @Transactional
    public Detail archiveListing(UUID actingUserId, UUID callerNgoId,
                                 UUID petId, String reason) {
        AdoptablePet pet = loadForMutation(petId, callerNgoId);

        if (pet.getStatus() == AdoptablePetStatus.ARCHIVED) {
            // idempotent
            return toDetail(pet, ngoRepo.findById(pet.getNgoId()).orElse(null),
                    mediaRepo.findByAdoptablePetIdOrderByDisplayOrderAsc(petId));
        }
        if (pet.getStatus() == AdoptablePetStatus.ADOPTED) {
            throw new IllegalStateException(
                    "Cannot archive a pet that has already been adopted.");
        }

        pet.setStatus(AdoptablePetStatus.ARCHIVED);
        AdoptablePet saved = petRepo.save(pet);

        auditService.log(AuditTargetType.PET_LISTING, saved.getId(), actingUserId,
                "LISTING_ARCHIVED", reason, null);

        // US-2.2.4 AC#3 — "Pending applications flagged".
        // Write one FLAGGED_BY_ARCHIVE row to the audit log per active app
        // for this pet so the NGO review queue shows them with a badge.
        // We DON'T auto-withdraw — the reviewer should make that call.
        List<AdoptionApplicationStatus> activeStatuses = List.of(
                AdoptionApplicationStatus.DRAFT,
                AdoptionApplicationStatus.SUBMITTED,
                AdoptionApplicationStatus.UNDER_REVIEW,
                AdoptionApplicationStatus.CLARIFICATION_REQUESTED);
        List<AdoptionApplication> affected =
                applicationRepo.findByAdoptablePetIdAndStatusIn(saved.getId(), activeStatuses);
        for (AdoptionApplication app : affected) {
            auditService.log(AuditTargetType.APPLICATION, app.getId(), actingUserId,
                    "FLAGGED_BY_PET_ARCHIVE", reason,
                    "{\"petId\":\"" + saved.getId() + "\"}");
        }
        log.info("AdoptablePet {} archived by user {} — flagged {} active application(s)",
                saved.getId(), actingUserId, affected.size());

        return toDetail(saved, ngoRepo.findById(saved.getNgoId()).orElse(null),
                mediaRepo.findByAdoptablePetIdOrderByDisplayOrderAsc(saved.getId()));
    }

    // ═════════════════════════════════════════════════════════════════
    //  NGO dashboard listing (all statuses the NGO owns)
    // ═════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public PageResponse<Summary> listForNgo(UUID callerNgoId,
                                            FilterRequest filter,
                                            String sort,
                                            int page,
                                            int size) {
        Specification<AdoptablePet> spec = buildSpec(filter, null, callerNgoId);
        Pageable pageable = PageRequest.of(clampPage(page), clampSize(size), buildDbSort(sort));
        Page<AdoptablePet> pageResult = petRepo.findAll(spec, pageable);
        Map<UUID, String> ngoNames = fetchNgoNames(
                pageResult.getContent().stream().map(AdoptablePet::getNgoId).toList());
        Map<UUID, AdoptionMedia> primary = fetchPrimaryMedia(
                pageResult.getContent().stream().map(AdoptablePet::getId).toList());
        return PageResponse.from(pageResult, p -> toSummary(p,
                ngoNames.get(p.getNgoId()), primary.get(p.getId()), null, null));
    }

    // ─── helpers ─────────────────────────────────────────────────────

    /**
     * Load a pet for a mutation, enforcing NGO ownership when the caller
     * is bound to an NGO. If callerNgoId is null (dev mode, no JWT ngo),
     * ownership is skipped but the pet must still exist.
     */
    private AdoptablePet loadForMutation(UUID petId, UUID callerNgoId) {
        if (callerNgoId != null) {
            return petRepo.findByIdAndNgoId(petId, callerNgoId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "AdoptablePet " + petId + " not found for this NGO"));
        }
        return petRepo.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("AdoptablePet", petId));
    }

    private Specification<AdoptablePet> buildSpec(FilterRequest f,
                                                  AdoptablePetStatus forcedStatus,
                                                  UUID forcedNgoId) {
        Specification<AdoptablePet> spec = Specification.where(hasStatus(forcedStatus))
                .and(hasNgo(forcedNgoId));
        if (f == null) return spec;
        return spec
                .and(speciesEq(f.getSpecies()))
                .and(breedEq(f.getBreed()))
                .and(genderEq(f.getGender()))
                .and(cityEq(f.getCity()))
                .and(minAge(f.getMinAgeMonths()))
                .and(maxAge(f.getMaxAgeMonths()))
                .and(specialNeedsEq(f.getSpecialNeeds()))
                .and(adoptionReadyEq(f.getAdoptionReady()))
                .and(vaccinatedEq(f.getVaccinated()));
    }

    /** DB-side sort — "nearest" is handled separately in-memory. */
    private Sort buildDbSort(String sort) {
        if (sort == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sort.toLowerCase()) {
            case "ready" -> Sort.by(Sort.Order.desc("isAdoptionReady"),
                                    Sort.Order.desc("createdAt"));
            case "newest", "nearest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private PageResponse<Summary> paginateInMemory(List<AdoptablePet> sorted,
                                                   int page, int size,
                                                   Double lat, Double lon) {
        int p = clampPage(page);
        int s = clampSize(size);
        int from = Math.min(p * s, sorted.size());
        int to   = Math.min(from + s, sorted.size());
        List<AdoptablePet> slice = sorted.subList(from, to);
        Map<UUID, String> ngoNames = fetchNgoNames(
                slice.stream().map(AdoptablePet::getNgoId).toList());
        Map<UUID, AdoptionMedia> primary = fetchPrimaryMedia(
                slice.stream().map(AdoptablePet::getId).toList());

        Page<AdoptablePet> pagePortion = new PageImpl<>(slice,
                PageRequest.of(p, s), sorted.size());
        return PageResponse.from(pagePortion, pet -> toSummary(pet,
                ngoNames.get(pet.getNgoId()), primary.get(pet.getId()), lat, lon));
    }

    private Map<UUID, String> fetchNgoNames(List<UUID> ngoIds) {
        if (ngoIds == null || ngoIds.isEmpty()) return Map.of();
        return ngoRepo.findAllById(ngoIds.stream().distinct().toList()).stream()
                .collect(Collectors.toMap(Ngo::getId, Ngo::getName, (a, b) -> a));
    }

    private Map<UUID, AdoptionMedia> fetchPrimaryMedia(List<UUID> petIds) {
        if (petIds == null || petIds.isEmpty()) return Map.of();
        Map<UUID, AdoptionMedia> map = new java.util.HashMap<>();
        for (UUID id : petIds.stream().distinct().toList()) {
            mediaRepo.findByAdoptablePetIdAndIsPrimaryTrue(id).ifPresent(m -> map.put(id, m));
        }
        return map;
    }

    private Summary toSummary(AdoptablePet p, String ngoName, AdoptionMedia primary,
                              Double lat, Double lon) {
        Double distanceKm = (lat != null && lon != null)
                ? distanceKm(lat, lon, p.getLatitude(), p.getLongitude())
                : null;
        return Summary.builder()
                .id(p.getId())
                .ngoId(p.getNgoId())
                .ngoName(ngoName)
                .name(p.getName())
                .species(p.getSpecies())
                .breed(p.getBreed())
                .ageMonths(p.getAgeMonths())
                .gender(p.getGender())
                .locationCity(p.getLocationCity())
                .isAdoptionReady(p.isAdoptionReady())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .primaryImageUrl(primary != null ? primary.getFileUrl() : null)
                .distanceKm(distanceKm)
                .build();
    }

    private Detail toDetail(AdoptablePet p, Ngo ngo, List<AdoptionMedia> media) {
        return Detail.builder()
                .id(p.getId())
                .ngoId(p.getNgoId())
                .ngoName(ngo != null ? ngo.getName() : null)
                .ngoContactPhone(null)    // Ngo entity doesn't yet store contact; Wave 3 adds owner
                .ngoContactEmail(null)
                .name(p.getName())
                .species(p.getSpecies())
                .breed(p.getBreed())
                .gender(p.getGender())
                .ageMonths(p.getAgeMonths())
                .sizeCategory(p.getSizeCategory())
                .color(p.getColor())
                .description(p.getDescription())
                .temperament(p.getTemperament())
                .medicalSummary(p.getMedicalSummary())
                .vaccinationStatus(p.getVaccinationStatus())
                .specialNeeds(p.isSpecialNeeds())
                .specialNeedsNotes(p.getSpecialNeedsNotes())
                .locationCity(p.getLocationCity())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .isAdoptionReady(p.isAdoptionReady())
                .status(p.getStatus() != null ? p.getStatus().name() : null)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .media(media == null ? List.of()
                        : media.stream().map(this::toMediaResponse).toList())
                .build();
    }

    private MediaResponse toMediaResponse(AdoptionMedia m) {
        return MediaResponse.builder()
                .id(m.getId())
                .adoptablePetId(m.getAdoptablePetId())
                .fileUrl(m.getFileUrl())
                .fileName(m.getFileName())
                .mediaType(m.getMediaType() != null ? m.getMediaType().name() : null)
                .displayOrder(m.getDisplayOrder())
                .isPrimary(m.isPrimary())
                .uploadedAt(m.getUploadedAt())
                .build();
    }

    private UUID resolveNgoId(UUID callerNgoId, UUID bodyNgoId) {
        if (callerNgoId != null) return callerNgoId;         // authenticated NGO_REP wins
        if (bodyNgoId   != null) return bodyNgoId;            // dev-mode override
        throw new IllegalArgumentException(
                "ngoId is required (either via authenticated NGO_REP user or in request body).");
    }

    private void ensureNgoExists(UUID ngoId) {
        if (!ngoRepo.existsById(ngoId)) {
            throw new ResourceNotFoundException("Ngo", ngoId);
        }
    }

    private AdoptablePetStatus parseStatus(String raw) {
        try {
            return AdoptablePetStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid status '" + raw + "'. Allowed: LISTED, ON_HOLD, ADOPTED, ARCHIVED");
        }
    }

    /**
     * PATCH can only move between LISTED and ON_HOLD. ADOPTED and ARCHIVED
     * transitions go through dedicated endpoints (archive, Wave 3 completion).
     */
    private void guardStatusTransition(AdoptablePetStatus from, AdoptablePetStatus to) {
        if (from == to) return;
        boolean ok =
                (from == AdoptablePetStatus.LISTED  && to == AdoptablePetStatus.ON_HOLD) ||
                (from == AdoptablePetStatus.ON_HOLD && to == AdoptablePetStatus.LISTED);
        if (!ok) {
            throw new IllegalStateException(
                    "Cannot change status from " + from + " to " + to
                            + " via PATCH. Use dedicated archive/completion endpoints.");
        }
    }

    private <T> void apply(StringBuilder changed, String fieldName,
                           java.util.function.Consumer<T> setter, T value) {
        setter.accept(value);
        changed.append("\"").append(fieldName).append("\":\"")
                .append(safe(String.valueOf(value))).append("\",");
    }

    private static String safe(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", " ").replace("\r", " ");
    }

    private static int clampPage(int page) { return Math.max(page, 0); }

    private static int clampSize(int size) {
        if (size <= 0) return DEFAULT_PAGE_SIZE;
        return Math.min(size, MAX_PAGE_SIZE);
    }

    /** Haversine in km; nulls treated as 0 distance (e.g. pet with no geo). */
    private static double distanceKm(Double lat1, Double lon1,
                                     BigDecimal lat2, BigDecimal lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0.0;
        final double R = 6371;
        double dLat = Math.toRadians(lat2.doubleValue() - lat1);
        double dLon = Math.toRadians(lon2.doubleValue() - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2.doubleValue()))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /** Unused helper retained so linter doesn't trim imports during edits. */
    @SuppressWarnings("unused")
    private LocalDateTime now() { return LocalDateTime.now(); }
}
