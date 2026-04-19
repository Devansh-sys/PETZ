package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.hospital.dto.PetDtos.PetCreateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.PetDtos.PetResponse;
import com.cts.mfrp.petzbackend.hospital.model.Pet;
import com.cts.mfrp.petzbackend.hospital.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Pet service — US-3.4.3 "Select Pet for Appointment".
 *   - list pets owned by a user (drives the selection UI)
 *   - register a new pet (the "add new pet" option)
 *   - existence check used by {@link AppointmentBookingService} at confirm time
 */
@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepo;

    @Transactional(readOnly = true)
    public List<PetResponse> listPetsForUser(UUID userId) {
        return petRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PetResponse registerPet(UUID userId, PetCreateRequest req) {
        Pet pet = Pet.builder()
                .userId(userId)
                .name(req.getName())
                .species(req.getSpecies())
                .breed(req.getBreed())
                .dateOfBirth(req.getDateOfBirth())
                .build();
        return toResponse(petRepo.save(pet));
    }

    /** Confirms the pet belongs to the given user; throws if not. */
    @Transactional(readOnly = true)
    public void assertOwnership(UUID petId, UUID userId) {
        if (!petRepo.existsByIdAndUserId(petId, userId)) {
            throw new ResourceNotFoundException(
                    "Pet " + petId + " not found for user " + userId);
        }
    }

    private PetResponse toResponse(Pet p) {
        return PetResponse.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .name(p.getName())
                .species(p.getSpecies())
                .breed(p.getBreed())
                .dateOfBirth(p.getDateOfBirth())
                .build();
    }
}
