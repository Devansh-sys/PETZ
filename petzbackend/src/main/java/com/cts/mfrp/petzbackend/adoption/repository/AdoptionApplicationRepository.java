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

@Repository
public interface AdoptionApplicationRepository
        extends JpaRepository<AdoptionApplication, UUID>,
                JpaSpecificationExecutor<AdoptionApplication> {

    List<AdoptionApplication> findByAdopterIdOrderByCreatedAtDesc(UUID adopterId);

    Optional<AdoptionApplication> findFirstByAdopterIdAndAdoptablePetIdAndStatusIn(
            UUID adopterId, UUID adoptablePetId, List<AdoptionApplicationStatus> statuses);

    Optional<AdoptionApplication> findByIdAndAdopterId(UUID id, UUID adopterId);

    Page<AdoptionApplication> findByNgoId(UUID ngoId, Pageable pageable);

    Optional<AdoptionApplication> findByIdAndNgoId(UUID id, UUID ngoId);

    List<AdoptionApplication> findByAdoptablePetIdAndStatusIn(
            UUID adoptablePetId, List<AdoptionApplicationStatus> statuses);

    /** US-4.3 dashboard — application count per status for an NGO. */
    long countByNgoIdAndStatus(UUID ngoId, AdoptionApplicationStatus status);

    /** US-4.3 dashboard — total applications across multiple statuses for an NGO. */
    long countByNgoIdAndStatusIn(UUID ngoId, List<AdoptionApplicationStatus> statuses);

    List<AdoptionApplication> findByStatusAndLastActivityAtBefore(
            AdoptionApplicationStatus status, LocalDateTime cutoff);
}
