package com.cts.mfrp.petzbackend.ngo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * US-4.3 — DTOs for NGO self-registration and profile management.
 *
 *   POST /api/v1/ngo/register   → RegisterNgoRequest → NgoProfileResponse
 *   GET  /api/v1/ngo/profile    → NgoProfileResponse (+ dashboard stats)
 *   PATCH /api/v1/ngo/profile   → NgoUpdateRequest   → NgoProfileResponse
 */
public class NgoRegistrationDtos {

    private NgoRegistrationDtos() {}

    // ── Register ──────────────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterNgoRequest {

        @NotBlank(message = "NGO name is required")
        @Size(max = 200)
        private String name;

        /** Approximate HQ latitude (used for nearest-NGO matching). */
        private double latitude;
        private double longitude;

        @Size(max = 200)
        private String contactEmail;

        @Size(max = 30)
        private String contactPhone;

        @Size(max = 500)
        private String address;

        /** Optional government / trust registration number. */
        @Size(max = 100)
        private String registrationNumber;

        @Size(max = 2000)
        private String description;
    }

    // ── Update ────────────────────────────────────────────────────────────

    /** All fields optional — only non-null values are applied. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NgoUpdateRequest {
        @Size(max = 200)
        private String name;
        private Double latitude;
        private Double longitude;
        @Size(max = 200)
        private String contactEmail;
        @Size(max = 30)
        private String contactPhone;
        @Size(max = 500)
        private String address;
        @Size(max = 100)
        private String registrationNumber;
        @Size(max = 2000)
        private String description;
    }

    // ── Profile response ──────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NgoProfileResponse {
        private UUID   id;
        private String name;
        private double latitude;
        private double longitude;
        private boolean active;
        private boolean verified;
        private UUID   ownerUserId;
        private String contactEmail;
        private String contactPhone;
        private String address;
        private String registrationNumber;
        private String description;
        private LocalDateTime createdAt;
    }

    // ── Dashboard ─────────────────────────────────────────────────────────

    /**
     * Summary stats shown on the NGO rep's home dashboard.
     * All counts are scoped to the caller's own NGO.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NgoDashboardResponse {
        private NgoProfileResponse profile;

        // Pet listings
        private long totalListings;
        private long activeListings;    // status = LISTED
        private long archivedListings;  // status = ARCHIVED
        private long adoptedPets;       // status = ADOPTED

        // Applications
        private long pendingApplications;   // SUBMITTED + UNDER_REVIEW
        private long approvedApplications;
        private long rejectedApplications;

        // Completed adoptions
        private long completedAdoptions;
    }
}
