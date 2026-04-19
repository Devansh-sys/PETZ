package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PetRepository extends JpaRepository<Pet, UUID> {

    /** US-3.4.3 AC#1 — list all pets owned by a user. */
    List<Pet> findByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
