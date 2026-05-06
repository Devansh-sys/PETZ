package com.petz.service;

import com.petz.dto.request.AdoptionApplicationRequest;
import com.petz.dto.request.AnimalRequest;
import com.petz.entity.AdoptableAnimal;
import com.petz.entity.AdoptionApplication;
import com.petz.entity.Ngo;
import com.petz.enums.AdoptionStatus;
import com.petz.enums.AnimalStatus;
import com.petz.exception.BadRequestException;
import com.petz.exception.ResourceNotFoundException;
import com.petz.repository.AdoptableAnimalRepository;
import com.petz.repository.AdoptionApplicationRepository;
import com.petz.repository.NgoRepository;
import com.petz.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdoptionService {

    private final AdoptableAnimalRepository animalRepo;
    private final AdoptionApplicationRepository applicationRepo;
    private final NgoRepository ngoRepo;
    private final NotificationService notificationService;
    private final FileStorageUtil fileStorage;

    // ── Animal CRUD (NGO) ─────────────────────────────────────────────

    public AdoptableAnimal addAnimal(Long ngoUserId, AnimalRequest req) {
        Ngo ngo = getNgo(ngoUserId);
        AdoptableAnimal a = new AdoptableAnimal();
        a.setNgoId(ngo.getId());
        a.setName(req.getName());
        a.setSpecies(req.getSpecies());
        a.setBreed(req.getBreed());
        a.setAgeMonths(req.getAgeMonths());
        a.setGender(req.getGender());
        a.setDescription(req.getDescription());
        a.setCity(req.getCity());
        if (req.getIsVaccinated() != null) a.setIsVaccinated(req.getIsVaccinated());
        if (req.getIsNeutered() != null)   a.setIsNeutered(req.getIsNeutered());
        return animalRepo.save(a);
    }

    public AdoptableAnimal updateAnimal(Long id, Long ngoUserId, AnimalRequest req) {
        Ngo ngo = getNgo(ngoUserId);
        AdoptableAnimal a = getAnimalById(id);
        if (!a.getNgoId().equals(ngo.getId())) throw new BadRequestException("Not your animal listing.");
        if (req.getName() != null)         a.setName(req.getName());
        if (req.getSpecies() != null)      a.setSpecies(req.getSpecies());
        if (req.getBreed() != null)        a.setBreed(req.getBreed());
        if (req.getAgeMonths() != null)    a.setAgeMonths(req.getAgeMonths());
        if (req.getGender() != null)       a.setGender(req.getGender());
        if (req.getDescription() != null)  a.setDescription(req.getDescription());
        if (req.getCity() != null)         a.setCity(req.getCity());
        if (req.getIsVaccinated() != null) a.setIsVaccinated(req.getIsVaccinated());
        if (req.getIsNeutered() != null)   a.setIsNeutered(req.getIsNeutered());
        return animalRepo.save(a);
    }

    public AdoptableAnimal uploadAnimalPhoto(Long id, Long ngoUserId, MultipartFile file) throws IOException {
        Ngo ngo = getNgo(ngoUserId);
        AdoptableAnimal a = getAnimalById(id);
        if (!a.getNgoId().equals(ngo.getId())) throw new BadRequestException("Not your animal listing.");
        a.setPhotoUrl(fileStorage.store(file, "animal-photos"));
        return animalRepo.save(a);
    }

    public List<AdoptableAnimal> browseAnimals(String species, String city) {
        if (species != null && city != null)
            return animalRepo.findByStatusAndSpecies(AnimalStatus.AVAILABLE, species)
                    .stream().filter(a -> city.equalsIgnoreCase(a.getCity())).toList();
        if (species != null)
            return animalRepo.findByStatusAndSpecies(AnimalStatus.AVAILABLE, species);
        if (city != null)
            return animalRepo.findByStatusAndCity(AnimalStatus.AVAILABLE, city);
        return animalRepo.findByStatus(AnimalStatus.AVAILABLE);
    }

    public AdoptableAnimal getAnimalById(Long id) {
        return animalRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Animal not found: " + id));
    }

    public List<AdoptableAnimal> getByNgo(Long ngoUserId) {
        Ngo ngo = getNgo(ngoUserId);
        return animalRepo.findByNgoId(ngo.getId());
    }

    // ── Application (User) ────────────────────────────────────────────

    public AdoptionApplication apply(Long userId, AdoptionApplicationRequest req) {
        AdoptableAnimal animal = getAnimalById(req.getAnimalId());
        if (animal.getStatus() != AnimalStatus.AVAILABLE)
            throw new BadRequestException("Animal is not available for adoption.");

        boolean exists = applicationRepo.existsByApplicantIdAndAnimalIdAndStatusNot(
                userId, req.getAnimalId(), AdoptionStatus.REJECTED);
        if (exists) throw new BadRequestException("You already have an active application for this animal.");

        AdoptionApplication app = new AdoptionApplication();
        app.setApplicantId(userId);
        app.setAnimalId(req.getAnimalId());
        app.setNgoId(animal.getNgoId());
        app.setReason(req.getReason());
        app.setExperience(req.getExperience());
        app.setHousingType(req.getHousingType());
        app.setHasOtherPets(req.getHasOtherPets());
        app = applicationRepo.save(app);

        // Notify NGO owner
        Ngo ngo = ngoRepo.findById(animal.getNgoId()).orElse(null);
        if (ngo != null) {
            notificationService.notifyUser(ngo.getOwnerUserId(),
                    "New Adoption Application",
                    "A new adoption application has been received for " + animal.getName(),
                    app.getId(), "ADOPTION");
        }

        return app;
    }

    public AdoptionApplication reviewApplication(Long appId, Long ngoUserId, String status, String notes) {
        Ngo ngo = getNgo(ngoUserId);
        AdoptionApplication app = applicationRepo.findById(appId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + appId));
        if (!app.getNgoId().equals(ngo.getId())) throw new BadRequestException("Not your NGO's application.");

        AdoptionStatus newStatus;
        try { newStatus = AdoptionStatus.valueOf(status.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Invalid status: " + status); }

        app.setStatus(newStatus);
        if (notes != null) app.setAdminNotes(notes);
        app = applicationRepo.save(app);

        if (newStatus == AdoptionStatus.APPROVED) {
            AdoptableAnimal animal = getAnimalById(app.getAnimalId());
            animal.setStatus(AnimalStatus.RESERVED);
            animalRepo.save(animal);
        }

        notificationService.notifyUser(app.getApplicantId(),
                "Adoption Application Update",
                "Your adoption application status: " + newStatus.name() + (notes != null ? ". " + notes : ""),
                app.getId(), "ADOPTION");

        return app;
    }

    public List<AdoptionApplication> getApplicationsByUser(Long userId) {
        return applicationRepo.findByApplicantId(userId);
    }

    public List<AdoptionApplication> getApplicationsByNgo(Long ngoUserId) {
        Ngo ngo = getNgo(ngoUserId);
        return applicationRepo.findByNgoId(ngo.getId());
    }

    public List<AdoptionApplication> getAllApplications() {
        return applicationRepo.findAll();
    }

    private Ngo getNgo(Long ownerUserId) {
        return ngoRepo.findByOwnerUserId(ownerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found for user " + ownerUserId));
    }
}
