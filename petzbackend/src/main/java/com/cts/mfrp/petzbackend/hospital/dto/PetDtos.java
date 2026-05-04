package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTOs for the Pet module (US-3.4.3).
 */
public class PetDtos {

    private PetDtos() {}

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PetResponse {
        private UUID id;
        private UUID userId;
        private String name;
        private String species;
        private String gender;
        private String breed;
        private LocalDate dateOfBirth;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PetCreateRequest {
        @NotBlank(message = "Pet name is required")
        private String name;
        private String species;
        private String gender;
        private String breed;
        private LocalDate dateOfBirth;
    }
}
