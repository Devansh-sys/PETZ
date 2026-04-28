package com.cts.mfrp.petzbackend.adoption.repository;

import com.cts.mfrp.petzbackend.adoption.enums.FollowUpStatus;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionFollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * US-2.5.3 + US-2.5.4 repository for {@link AdoptionFollowUp}.
 */
@Repository
public interface AdoptionFollowUpRepository extends JpaRepository<AdoptionFollowUp, UUID> {

    /** Timeline view on one adoption (sorted by due date). */
    List<AdoptionFollowUp> findByAdoptionIdOrderByDueDateAsc(UUID adoptionId);

    /** Scoped ownership lookup used by the NGO PATCH endpoint. */
    Optional<AdoptionFollowUp> findByIdAndAdoptionId(UUID id, UUID adoptionId);

    /**
     * Daily reminder job input — follow-ups whose due date has arrived
     * and no one's acted yet. {@code reminderSentAt < today} keeps the
     * job idempotent.
     */
    List<AdoptionFollowUp> findByStatusAndDueDateLessThanEqual(
            FollowUpStatus status, LocalDate today);

    /** Admin dashboard: flagged follow-ups surface in US-2.5.4 AC#4. */
    List<AdoptionFollowUp> findByConcernFlagTrueOrderByCreatedAtDesc();

    // ── Admin metrics (US-2.6.1 "follow-up compliance") ────────────
    long countByStatus(FollowUpStatus status);
    long countByStatusAndDueDateLessThanEqual(FollowUpStatus status, LocalDate cutoff);
}
