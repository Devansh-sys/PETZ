package com.petz.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdoptionApplicationRequest {

    @NotNull
    private Long animalId;

    private String reason;
    private String experience;
    private String housingType;
    private Boolean hasOtherPets;
}
