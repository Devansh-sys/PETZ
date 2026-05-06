package com.petz.service;

import com.petz.dto.request.PetRequest;
import com.petz.entity.Pet;
import com.petz.exception.ResourceNotFoundException;
import com.petz.repository.PetRepository;
import com.petz.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepo;
    private final FileStorageUtil fileStorage;

    public Pet addPet(Long ownerId, PetRequest req) {
        Pet p = new Pet();
        p.setOwnerId(ownerId);
        p.setName(req.getName());
        p.setSpecies(req.getSpecies());
        p.setBreed(req.getBreed());
        p.setAgeYears(req.getAgeYears());
        p.setGender(req.getGender());
        p.setWeightKg(req.getWeightKg());
        p.setNotes(req.getNotes());
        return petRepo.save(p);
    }

    public Pet updatePet(Long id, Long ownerId, PetRequest req) {
        Pet p = getPet(id);
        if (!p.getOwnerId().equals(ownerId)) {
            throw new ResourceNotFoundException("Pet not found for this user.");
        }
        if (req.getName() != null)     p.setName(req.getName());
        if (req.getSpecies() != null)  p.setSpecies(req.getSpecies());
        if (req.getBreed() != null)    p.setBreed(req.getBreed());
        if (req.getAgeYears() != null) p.setAgeYears(req.getAgeYears());
        if (req.getGender() != null)   p.setGender(req.getGender());
        if (req.getWeightKg() != null) p.setWeightKg(req.getWeightKg());
        if (req.getNotes() != null)    p.setNotes(req.getNotes());
        return petRepo.save(p);
    }

    public List<Pet> getByOwner(Long ownerId) {
        return petRepo.findByOwnerId(ownerId);
    }

    public Pet getPet(Long id) {
        return petRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found: " + id));
    }

    public Pet uploadPhoto(Long id, Long ownerId, MultipartFile file) throws IOException {
        Pet p = getPet(id);
        if (!p.getOwnerId().equals(ownerId)) throw new ResourceNotFoundException("Pet not found.");
        String url = fileStorage.store(file, "pet-photos");
        p.setPhotoUrl(url);
        return petRepo.save(p);
    }

    public void delete(Long id, Long ownerId) {
        Pet p = getPet(id);
        if (!p.getOwnerId().equals(ownerId)) throw new ResourceNotFoundException("Pet not found.");
        petRepo.delete(p);
    }
}
