package com.cts.mfrp.petzbackend.adoption.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Request and response shapes for Epic 2.1 + 2.2 pet-listing endpoints.
 *
 *   Summary        — public catalog card (US-2.1.1 AC#2)
 *   Detail         — full pet profile (US-2.1.4)
 *   CreateRequest  — US-2.2.1 "Create pet listing"
 *   UpdateRequest  — US-2.2.2 "Update pet profile" (partial; null fields ignored)
 *   FilterRequest  — US-2.1.2 multi-select filters (bound from @RequestParams)
 */
public class AdoptablePetDtos {

    private AdoptablePetDtos() {}

    // ── Public catalog card (US-2.1.1) ──────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private UUID id;
        private UUID ngoId;
        private String ngoName;
        private String name;
        private String species;
        private String breed;
        private Integer ageMonths;
        private String gender;
        private String locationCity;
        private boolean isAdoptionReady;   // US-2.1.1 AC#2 "readiness badge"
        private String status;
        private String primaryImageUrl;    // AC#2 "image"
        private Double distanceKm;         // populated only when client sent lat/lon
    }

    // ── Full profile (US-2.1.4) ─────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Detail {
        private UUID id;
        private UUID ngoId;
        private String ngoName;
        private String ngoContactPhone;
        private String ngoContactEmail;
        private String name;
        private String species;
        private String breed;
        private String gender;
        private Integer ageMonths;
        private String sizeCategory;
        private String color;
        private String description;
        private String temperament;
        private String medicalSummary;
        private String vaccinationStatus;
        private boolean specialNeeds;
        private String specialNeedsNotes;
        private String locationCity;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private boolean isAdoptionReady;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        /** Ordered gallery (primary first). */
        private List<AdoptionMediaDtos.MediaResponse> media;
    }

    // ── Create (US-2.2.1) ───────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        /**
         * Dev override — if the caller is not yet bound to an NGO via
         * {@code User.ngoId}, they can pass ngoId here. Service prefers
         * the authenticated user's ngoId when available.
         */
        private UUID ngoId;

        @NotBlank(message = "Pet name is required")
        private String name;

        @NotBlank(message = "Species is required")
        private String species;

        private String breed;
        private String gender;

        @Min(value = 0, message = "ageMonths must be >= 0")
        private Integer ageMonths;

        private String sizeCategory;
        private String color;
        private String description;
        private String temperament;
        private String medicalSummary;
        private String vaccinationStatus;

        /** Defaults to false when null. */
        private Boolean specialNeeds;
        private String specialNeedsNotes;

        private String locationCity;

        @DecimalMin(value = "-90.0",  message = "latitude must be >= -90")
        @DecimalMax(value = "90.0",   message = "latitude must be <= 90")
        private BigDecimal latitude;

        @DecimalMin(value = "-180.0", message = "longitude must be >= -180")
        @DecimalMax(value = "180.0",  message = "longitude must be <= 180")
        private BigDecimal longitude;

        /** US-2.2.1 AC#4 — readiness toggle; defaults to false when null. */
        private Boolean isAdoptionReady;
    }

    // ── Update (US-2.2.2) ───────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String name;
        private String species;
        private String breed;
        private String gender;
        @Min(value = 0, message = "ageMonths must be >= 0")
        private Integer ageMonths;
        private String sizeCategory;
        private String color;
        private String description;
        private String temperament;
        private String medicalSummary;
        private String vaccinationStatus;
        private Boolean specialNeeds;
        private String specialNeedsNotes;
        private String locationCity;
        @DecimalMin(value = "-90.0")  @DecimalMax(value = "90.0")
        private BigDecimal latitude;
        @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
        private BigDecimal longitude;
        private Boolean isAdoptionReady;
        /**
         * Optional status change — allows NGO to move LISTED <-> ON_HOLD
         * via the same PATCH. Service validates allowed transitions;
         * ADOPTED/ARCHIVED are set by dedicated endpoints.
         */
        private String status;
    }

    // ── Filter (US-2.1.2) ───────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FilterRequest {
        private String species;           // multi-select handled by repeating the param name
        private String breed;
        private Integer minAgeMonths;
        private Integer maxAgeMonths;
        private String city;
        private Boolean vaccinated;       // true -> vaccinationStatus non-null/non-empty
        private Boolean specialNeeds;
        private Boolean adoptionReady;
        private String gender;
    }

    // ── Archive action (US-2.2.4) ───────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ArchiveRequest {
        @NotNull(message = "reason is required")
        private String reason;
    }
}
