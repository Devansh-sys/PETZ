package com.cts.mfrp.petzbackend.adoption.repository;

import com.cts.mfrp.petzbackend.adoption.model.AdoptionMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * US-2.2.3 repository for the pet media gallery.
 */
@Repository
public interface AdoptionMediaRepository extends JpaRepository<AdoptionMedia, UUID> {

    /** Gallery view — ordered by displayOrder (see AdoptionMediaService). */
    List<AdoptionMedia> findByAdoptablePetIdOrderByDisplayOrderAsc(UUID adoptablePetId);

    /** Used to unset the previous primary when a new one is picked. */
    Optional<AdoptionMedia> findByAdoptablePetIdAndIsPrimaryTrue(UUID adoptablePetId);

    /** Strict ownership check — media must belong to the given pet. */
    Optional<AdoptionMedia> findByIdAndAdoptablePetId(UUID id, UUID adoptablePetId);

    /** Count used to compute next displayOrder on upload. */
    long countByAdoptablePetId(UUID adoptablePetId);

    /** Batch fetch of primary images for a list of pets — replaces per-pet loop. */
    @Query("SELECT m FROM AdoptionMedia m WHERE m.adoptablePetId IN :petIds AND m.isPrimary = true")
    List<AdoptionMedia> findPrimaryByPetIdIn(@Param("petIds") List<UUID> petIds);
}
