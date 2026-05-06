package com.petz.dto.request;

import lombok.Data;

@Data
public class AnimalRequest {
    private String name;
    private String species;
    private String breed;
    private Integer ageMonths;
    private String gender;
    private String description;
    private String city;
    private Boolean isVaccinated;
    private Boolean isNeutered;
}
