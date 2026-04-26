package com.cts.mfrp.petzbackend.adoption.repository;

import com.cts.mfrp.petzbackend.adoption.enums.DisputeStatus;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionDispute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * US-2.6.3 repository for admin dispute queue.
 */
@Repository
public interface AdoptionDisputeRepository extends JpaRepository<AdoptionDispute, UUID> {

    /** Admin queue filter (defaults to OPEN). */
    Page<AdoptionDispute> findByStatus(DisputeStatus status, Pageable pageable);

    List<AdoptionDispute> findByAdoptionIdOrderByCreatedAtDesc(UUID adoptionId);
}
