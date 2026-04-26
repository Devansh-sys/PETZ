package com.cts.mfrp.petzbackend.ngo.service;

import com.cts.mfrp.petzbackend.adoption.enums.AdoptablePetStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptionApplicationStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AdoptionStatus;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptablePetRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionApplicationRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionRepository;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.ngo.dto.NgoRegistrationDtos.*;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * US-4.3 — NGO self-registration and profile management.
 *
 *   register()       POST /api/v1/ngo/register
 *   getProfile()     GET  /api/v1/ngo/profile
 *   updateProfile()  PATCH /api/v1/ngo/profile
 *   getDashboard()   GET  /api/v1/ngo/dashboard
 *
 * Security rule: a user can only manage the NGO they own
 * (User.ngoId == ngo.ownerUserId == calling user id).
 */
@Service
@RequiredArgsConstructor
public class NgoRegistrationService {

    private final NgoRepository                ngoRepo;
    private final UserRepository               userRepo;
    private final AdoptablePetRepository       petRepo;
    private final AdoptionApplicationRepository appRepo;
    private final AdoptionRepository           adoptionRepo;

    // ─── Registration ─────────────────────────────────────────────────────

    /**
     * US-4.3 — create a new NGO and link it to the calling user.
     *
     * Rules:
     *   1. The caller must not already own an NGO.
     *   2. NGO name must be unique (case-insensitive check skipped for now —
     *      admin reviews before verification anyway).
     *   3. A new Ngo row is inserted with isVerified=false, active=true.
     *   4. User.ngoId is updated to point to the new NGO.
     */
    @Transactional
    public NgoProfileResponse register(UUID callerId, RegisterNgoRequest req) {
        User caller = loadUser(callerId);

        // 1. Prevent duplicate registration.
        if (caller.getNgoId() != null) {
            throw new IllegalStateException(
                    "You are already linked to an NGO. Use PATCH /api/v1/ngo/profile to update it.");
        }
        // Also check if caller already owns one (ownerUserId path).
        ngoRepo.findByOwnerUserId(callerId).ifPresent(existing -> {
            throw new IllegalStateException(
                    "You already own NGO '" + existing.getName() + "' (id=" + existing.getId() + ").");
        });

        // 2. Create NGO.
        Ngo ngo = new Ngo();
        ngo.setName(req.getName().trim());
        ngo.setLatitude(req.getLatitude());
        ngo.setLongitude(req.getLongitude());
        ngo.setActive(true);
        ngo.setVerified(false);
        ngo.setOwnerUserId(callerId);
        ngo.setContactEmail(req.getContactEmail());
        ngo.setContactPhone(req.getContactPhone());
        ngo.setAddress(req.getAddress());
        ngo.setRegistrationNumber(req.getRegistrationNumber());
        ngo.setDescription(req.getDescription());
        Ngo saved = ngoRepo.save(ngo);

        // 3. Link user to NGO.
        caller.setNgoId(saved.getId());
        userRepo.save(caller);

        return toProfileResponse(saved);
    }

    // ─── Profile view ─────────────────────────────────────────────────────

    /**
     * US-4.3 — fetch the caller's own NGO profile.
     */
    @Transactional(readOnly = true)
    public NgoProfileResponse getProfile(UUID callerId) {
        Ngo ngo = resolveCallerNgo(callerId);
        return toProfileResponse(ngo);
    }

    // ─── Profile update ───────────────────────────────────────────────────

    /**
     * US-4.3 — partial update of NGO profile fields.
     * Only non-null request fields are applied.
     */
    @Transactional
    public NgoProfileResponse updateProfile(UUID callerId, NgoUpdateRequest req) {
        Ngo ngo = resolveCallerNgo(callerId);

        if (req.getName()               != null) ngo.setName(req.getName().trim());
        if (req.getLatitude()           != null) ngo.setLatitude(req.getLatitude());
        if (req.getLongitude()          != null) ngo.setLongitude(req.getLongitude());
        if (req.getContactEmail()       != null) ngo.setContactEmail(req.getContactEmail());
        if (req.getContactPhone()       != null) ngo.setContactPhone(req.getContactPhone());
        if (req.getAddress()            != null) ngo.setAddress(req.getAddress());
        if (req.getRegistrationNumber() != null) ngo.setRegistrationNumber(req.getRegistrationNumber());
        if (req.getDescription()        != null) ngo.setDescription(req.getDescription());

        return toProfileResponse(ngoRepo.save(ngo));
    }

    // ─── Dashboard ────────────────────────────────────────────────────────

    /**
     * US-4.3 — aggregated stats for the NGO's home dashboard.
     */
    @Transactional(readOnly = true)
    public NgoDashboardResponse getDashboard(UUID callerId) {
        Ngo ngo = resolveCallerNgo(callerId);
        UUID ngoId = ngo.getId();

        long totalListings    = petRepo.countByNgoId(ngoId);
        long activeListings   = petRepo.countByNgoIdAndStatus(ngoId, AdoptablePetStatus.LISTED);
        long archivedListings = petRepo.countByNgoIdAndStatus(ngoId, AdoptablePetStatus.ARCHIVED);
        long adoptedPets      = petRepo.countByNgoIdAndStatus(ngoId, AdoptablePetStatus.ADOPTED);

        long pendingApps = appRepo.countByNgoIdAndStatusIn(ngoId,
                List.of(AdoptionApplicationStatus.SUBMITTED,
                        AdoptionApplicationStatus.UNDER_REVIEW,
                        AdoptionApplicationStatus.CLARIFICATION_REQUESTED));
        long approvedApps = appRepo.countByNgoIdAndStatus(ngoId, AdoptionApplicationStatus.APPROVED);
        long rejectedApps = appRepo.countByNgoIdAndStatus(ngoId, AdoptionApplicationStatus.REJECTED);

        long completedAdoptions = adoptionRepo.countByNgoIdAndStatus(ngoId, AdoptionStatus.COMPLETED);

        return NgoDashboardResponse.builder()
                .profile(toProfileResponse(ngo))
                .totalListings(totalListings)
                .activeListings(activeListings)
                .archivedListings(archivedListings)
                .adoptedPets(adoptedPets)
                .pendingApplications(pendingApps)
                .approvedApplications(approvedApps)
                .rejectedApplications(rejectedApps)
                .completedAdoptions(completedAdoptions)
                .build();
    }

    // ─── helpers ──────────────────────────────────────────────────────────

    private User loadUser(UUID userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    /**
     * Resolve the NGO owned by the calling user.
     * Priority: User.ngoId → then ownerUserId lookup as fallback.
     */
    private Ngo resolveCallerNgo(UUID callerId) {
        User caller = loadUser(callerId);
        UUID ngoId = caller.getNgoId();
        if (ngoId != null) {
            return ngoRepo.findById(ngoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Ngo", ngoId));
        }
        // Fallback: maybe ngoId wasn't set on the user but they're the owner.
        return ngoRepo.findByOwnerUserId(callerId)
                .orElseThrow(() -> new IllegalStateException(
                        "You are not linked to any NGO. Register one first via POST /api/v1/ngo/register."));
    }

    private NgoProfileResponse toProfileResponse(Ngo n) {
        return NgoProfileResponse.builder()
                .id(n.getId())
                .name(n.getName())
                .latitude(n.getLatitude())
                .longitude(n.getLongitude())
                .active(n.isActive())
                .verified(n.isVerified())
                .ownerUserId(n.getOwnerUserId())
                .contactEmail(n.getContactEmail())
                .contactPhone(n.getContactPhone())
                .address(n.getAddress())
                .registrationNumber(n.getRegistrationNumber())
                .description(n.getDescription())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
