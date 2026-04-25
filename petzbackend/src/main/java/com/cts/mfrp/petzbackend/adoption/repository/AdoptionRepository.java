package com.cts.mfrp.petzbackend.adoption.repository;

import com.cts.mfrp.petzbackend.adoption.enums.AdoptionStatus;
import com.cts.mfrp.petzbackend.adoption.model.Adoption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Epic 2.5 repository for the finalized {@link Adoption} record.
 *
 * Kept intentionally small — once a row flips to COMPLETED, the service
 * refuses any further writes (US-2.5.2 AC#2 "Immutable post-finalization").
 */
@Repository
public interface AdoptionRepository extends JpaRepository<Adoption, UUID> {

    /** One-to-one with an application — uniqueness enforced in schema. */
    Optional<Adoption> findByApplicationId(UUID applicationId);

    /** NGO dashboard view — all adoptions this NGO facilitated. */
    List<Adoption> findByNgoIdOrderByCreatedAtDesc(UUID ngoId);

    /** Adopter's own history — deep-linking into hospital module pet list. */
    List<Adoption> findByAdopterIdOrderByCreatedAtDesc(UUID adopterId);

    /** Scoped ownership check for NGO mutations (schedule / confirm). */
    Optional<Adoption> findByIdAndNgoId(UUID id, UUID ngoId);

    // ── Admin metrics (US-2.6.1) ────────────────────────────────────
    long countByStatus(AdoptionStatus status);
    long countByFinalizedAtBetween(LocalDateTime from, LocalDateTime to);
    long countByStatusAndFinalizedAtBetween(
            AdoptionStatus status, LocalDateTime from, LocalDateTime to);
    long countByNgoIdAndStatus(UUID ngoId, AdoptionStatus status);

    /** City filter on metrics is applied via a JOIN on AdoptablePet.locationCity. */
    @org.springframework.data.jpa.repository.Query("""
        SELECT COUNT(a) FROM Adoption a, AdoptablePet p
        WHERE a.adoptablePetId = p.id
          AND a.status = :status
          AND LOWER(p.locationCity) = LOWER(:city)
    """)
    long countByStatusAndCity(AdoptionStatus status, String city);
}
