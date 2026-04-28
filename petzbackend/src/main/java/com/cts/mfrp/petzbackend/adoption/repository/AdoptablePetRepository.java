package com.cts.mfrp.petzbackend.adoption.repository;

import com.cts.mfrp.petzbackend.adoption.enums.AdoptablePetStatus;
import com.cts.mfrp.petzbackend.adoption.model.AdoptablePet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Epic 2.1 + 2.2 repository for {@link AdoptablePet}.
 *
 * Extends {@code JpaSpecificationExecutor} so the service can compose
 * multi-filter search (US-2.1.2) using {@code org.springframework.data
 * .jpa.domain.Specification} predicates without writing raw JPQL.
 */
@Repository
public interface AdoptablePetRepository
        extends JpaRepository<AdoptablePet, UUID>,
                JpaSpecificationExecutor<AdoptablePet> {

    // ── Public discovery (US-2.1.1) ─────────────────────────────────
    /** Paginated list of pets in a given status (usually LISTED for public). */
    Page<AdoptablePet> findByStatus(AdoptablePetStatus status, Pageable pageable);

    // ── NGO-scoped lookups (US-2.2) ─────────────────────────────────
    /** Strict ownership check — used on every mutation from NGO endpoints. */
    Optional<AdoptablePet> findByIdAndNgoId(UUID id, UUID ngoId);

    /** NGO dashboard view — includes archived pets. */
    Page<AdoptablePet> findByNgoId(UUID ngoId, Pageable pageable);

    /** Filtered NGO view (e.g. only LISTED pets for this NGO). */
    List<AdoptablePet> findByNgoIdAndStatus(UUID ngoId, AdoptablePetStatus status);
<<<<<<< Updated upstream

    /** US-4.3 dashboard — pet count per status for an NGO. */
    long countByNgoIdAndStatus(UUID ngoId, AdoptablePetStatus status);

    /** US-4.3 dashboard — total pets ever listed by this NGO. */
    long countByNgoId(UUID ngoId);
=======
>>>>>>> Stashed changes
}
