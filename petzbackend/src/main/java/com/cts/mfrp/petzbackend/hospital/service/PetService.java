package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.hospital.dto.PetDtos.PetCreateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.PetDtos.PetResponse;
import com.cts.mfrp.petzbackend.hospital.model.PatientPet;
import com.cts.mfrp.petzbackend.hospital.repository.PatientPetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Pet service for the hospital booking flow (US-3.4.3).
 * Reads and writes to patient_pets — NOT the adoption pets table.
 * Visible only to hospital/vet staff via appointment records.
 */
@Service
@RequiredArgsConstructor
public class PetService {

    private final PatientPetRepository patientPetRepo;

    @Transactional(readOnly = true)
    public List<PetResponse> listPetsForUser(UUID userId) {
        return patientPetRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PetResponse registerPet(UUID userId, PetCreateRequest req) {
        PatientPet pet = PatientPet.builder()
                .userId(userId)
                .name(req.getName())
                .species(req.getSpecies())
                .gender(req.getGender())
                .breed(req.getBreed())
                .dateOfBirth(req.getDateOfBirth())
                .build();
        return toResponse(patientPetRepo.save(pet));
    }

    /** Confirms the patient pet belongs to the given user; throws if not. */
    @Transactional(readOnly = true)
    public void assertOwnership(UUID petId, UUID userId) {
        if (!patientPetRepo.existsByIdAndUserId(petId, userId)) {
            throw new ResourceNotFoundException(
                    "Pet " + petId + " not found for user " + userId);
        }
    }

    private PetResponse toResponse(PatientPet p) {
        return PetResponse.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .name(p.getName())
                .species(p.getSpecies())
                .gender(p.getGender())
                .breed(p.getBreed())
                .dateOfBirth(p.getDateOfBirth())
                .build();
    }
}
