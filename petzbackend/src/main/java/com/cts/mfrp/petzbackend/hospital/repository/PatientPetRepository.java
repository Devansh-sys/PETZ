package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.PatientPet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientPetRepository extends JpaRepository<PatientPet, UUID> {

    List<PatientPet> findByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
