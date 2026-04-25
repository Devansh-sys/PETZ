package com.cts.mfrp.petzbackend.adoption.repository;

import com.cts.mfrp.petzbackend.adoption.enums.AdoptionApplicationStatus;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Epic 2.3 + 2.4 repository for {@link AdoptionApplication}.
 *
 * {@link JpaSpecificationExecutor} is extended so the NGO review list
 * (US-2.4.1) can compose multi-filter search predicates like the pet
 * catalog does.
 */
@Repository
public interface AdoptionApplicationRepository
        extends JpaRepository<AdoptionApplication, UUID>,
                JpaSpecificationExecutor<AdoptionApplication> {

    // ── Adopter views (US-2.3.5 / US-2.3.6 / US-2.3.1) ──────────────
    List<AdoptionApplication> findByAdopterIdOrderByCreatedAtDesc(UUID adopterId);

    /** Used by US-2.3.1 AC#2 duplicate check — "One active application per user per pet". */
    Optional<AdoptionApplication> findFirstByAdopterIdAndAdoptablePetIdAndStatusIn(
            UUID adopterId, UUID adoptablePetId, List<AdoptionApplicationStatus> statuses);

    /** Scoped detail read for adopter — proves the caller owns the application. */
    Optional<AdoptionApplication> findByIdAndAdopterId(UUID id, UUID adopterId);

    // ── NGO views (US-2.4.1) ────────────────────────────────────────
    Page<AdoptionApplication> findByNgoId(UUID ngoId, Pageable pageable);

    /** Scoped detail read for NGO — enforces ownership on every mutation. */
    Optional<AdoptionApplication> findByIdAndNgoId(UUID id, UUID ngoId);

    // ── Used when an AdoptablePet is archived (US-2.2.4 AC#3) ───────
    /** Active applications for a given pet — flagged when NGO archives. */
    List<AdoptionApplication> findByAdoptablePetIdAndStatusIn(
            UUID adoptablePetId, List<AdoptionApplicationStatus> statuses);

    /** US-4.3 dashboard — application count per status for an NGO. */
    long countByNgoIdAndStatus(UUID ngoId, AdoptionApplicationStatus status);

    /** US-4.3 dashboard — total applications across multiple statuses for an NGO. */
    long countByNgoIdAndStatusIn(UUID ngoId, List<AdoptionApplicationStatus> statuses);

    // ── Future cleanup job placeholder (US-2.3.2 AC#3) ──────────────
    /**
     * Drafts untouched for > 30 days are candidates for auto-expire.
     * Used by a future scheduled job (out of scope for Wave 2).
     */
    List<AdoptionApplication> findByStatusAndLastActivityAtBefore(
            AdoptionApplicationStatus status, LocalDateTime cutoff);
}
