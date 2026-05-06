package com.petz.dto.response;

import com.petz.entity.AdoptableAnimal;
import com.petz.entity.AdoptionApplication;
import com.petz.entity.Ngo;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AdoptionApplicationResponse {

    private Long id;
    private Long animalId;
    private Long applicantId;
    private Long ngoId;
    private String reason;
    private String experience;
    private String housingType;
    private Boolean hasOtherPets;
    private String status;
    private String adminNotes;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    // Animal details
    private String animalName;
    private String animalSpecies;
    private String animalBreed;
    private Integer animalAgeMonths;
    private String animalGender;
    private String animalPhotoUrl;
    private Boolean animalIsVaccinated;
    private Boolean animalIsNeutered;
    private String animalCity;

    // NGO details
    private String ngoName;
    private String ngoPhone;
    private String ngoEmail;
    private String ngoCity;

    public static AdoptionApplicationResponse from(AdoptionApplication app, AdoptableAnimal animal, Ngo ngo) {
        AdoptionApplicationResponse r = new AdoptionApplicationResponse();
        r.setId(app.getId());
        r.setAnimalId(app.getAnimalId());
        r.setApplicantId(app.getApplicantId());
        r.setNgoId(app.getNgoId());
        r.setReason(app.getReason());
        r.setExperience(app.getExperience());
        r.setHousingType(app.getHousingType());
        r.setHasOtherPets(app.getHasOtherPets());
        r.setStatus(app.getStatus() != null ? app.getStatus().name() : null);
        r.setAdminNotes(app.getAdminNotes());
        r.setAppliedAt(app.getAppliedAt());
        r.setUpdatedAt(app.getUpdatedAt());

        if (animal != null) {
            r.setAnimalName(animal.getName());
            r.setAnimalSpecies(animal.getSpecies());
            r.setAnimalBreed(animal.getBreed());
            r.setAnimalAgeMonths(animal.getAgeMonths());
            r.setAnimalGender(animal.getGender());
            r.setAnimalPhotoUrl(animal.getPhotoUrl());
            r.setAnimalIsVaccinated(animal.getIsVaccinated());
            r.setAnimalIsNeutered(animal.getIsNeutered());
            r.setAnimalCity(animal.getCity());
        }
        if (ngo != null) {
            r.setNgoName(ngo.getName());
            r.setNgoPhone(ngo.getPhone());
            r.setNgoEmail(ngo.getEmail());
            r.setNgoCity(ngo.getCity());
        }
        return r;
    }
}
