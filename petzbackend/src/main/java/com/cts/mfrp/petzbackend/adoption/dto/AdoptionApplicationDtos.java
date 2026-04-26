package com.cts.mfrp.petzbackend.adoption.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTOs for Epic 2.3 + 2.4 endpoints.
 *
 *   StartRequest       — US-2.3.1 POST / body
 *   PersonalSection    — US-2.3.1 / US-2.3.2 PATCH /{id}/personal
 *   LifestyleSection   — PATCH /{id}/lifestyle
 *   ExperienceSection  — PATCH /{id}/experience
 *   ConsentSection     — PATCH /{id}/consent
 *   ApproveRequest     — US-2.4.3 POST /{id}/approve (confirm required)
 *   RejectRequest      — US-2.4.4 POST /{id}/reject  (reason mandatory)
 *   ClarifyRequest     — US-2.4.5 POST /{id}/clarify (questions list)
 *   WithdrawRequest    — US-2.3.6 POST /{id}/withdraw (optional reason)
 *   Summary / Detail   — read shapes
 *   StatusHistoryEntry — US-2.3.5 "Decision history with timestamps"
 */
public class AdoptionApplicationDtos {

    private AdoptionApplicationDtos() {}

    // ── Start ────────────────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StartRequest {
        @NotNull(message = "adoptablePetId is required")
        private UUID adoptablePetId;
    }

    // ── Form sections (each PATCH updates one of these) ──────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PersonalSection {
        @NotBlank(message = "fullName is required")
        private String fullName;
        @NotBlank(message = "phone is required")
        private String phone;
        private String email;
        private String addressLine;
        private String city;
        private String pincode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LifestyleSection {
        /** APARTMENT / HOUSE / OTHER — free text, frontend picks enum labels. */
        private String housingType;
        private Boolean hasYard;
        private Integer otherPetsCount;
        private Integer workScheduleHours;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExperienceSection {
        private Boolean prevPetOwnership;
        private String prevPetDetails;
        private String vetSupport;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConsentSection {
        /** All three must be true at submit time (US-2.3.3 AC#2). */
        private Boolean consentHomeVisit;
        private Boolean consentFollowUp;
        private Boolean consentBackgroundCheck;
    }

    // ── NGO actions ──────────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApproveRequest {
        /** US-2.4.3 AC#1 "Approval requires confirmation". */
        @AssertTrue(message = "confirm must be true to approve")
        private Boolean confirm;

        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RejectRequest {
        @NotBlank(message = "reason is required")
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClarifyRequest {
        @NotEmpty(message = "At least one question is required")
        private List<@NotBlank String> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WithdrawRequest {
        /** Optional — adopter can explain why. Not surfaced to NGO UI directly. */
        private String reason;
    }

    // ── Read responses ───────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Summary {
        private UUID id;
        private UUID adopterId;
        private String adopterName;
        private UUID adoptablePetId;
        private String petName;
        private UUID ngoId;
        private String status;
        private String currentStep;
        private LocalDateTime submittedAt;
        private LocalDateTime lastActivityAt;
        /** Useful to the NGO queue view (US-2.4.1) — count of pending docs. */
        private Long pendingDocCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Detail {
        private UUID id;
        private UUID adopterId;
        private String adopterName;
        private String adopterPhone;
        private String adopterEmail;
        private UUID adoptablePetId;
        private String petName;
        private UUID ngoId;
        private String ngoName;
        private String status;
        private String currentStep;

        // Form sections (echoed back so adopter can resume)
        private PersonalSection personal;
        private LifestyleSection lifestyle;
        private ExperienceSection experience;
        private ConsentSection consent;

        // NGO comms
        private String decisionReason;
        private String clarificationQuestions;

        // Documents
        private List<KycDocumentDtos.DocumentResponse> documents;

        // US-2.3.5 — "Decision history with timestamps"
        private List<StatusHistoryEntry> history;

        // Timestamps
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime lastActivityAt;
        private LocalDateTime submittedAt;
        private LocalDateTime decidedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusHistoryEntry {
        private String action;          // e.g. APPLICATION_SUBMITTED, APPROVED, CLARIFICATION_REQUESTED
        private String reason;
        private UUID actorId;
        private LocalDateTime performedAt;
    }
}
