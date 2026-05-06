package com.petz.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PetRequest {
    private String name;
    private String species;
    private String breed;
    private Integer ageYears;
    private String gender;
    private BigDecimal weightKg;
    private String notes;
}
