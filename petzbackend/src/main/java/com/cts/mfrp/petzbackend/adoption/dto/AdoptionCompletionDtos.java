package com.cts.mfrp.petzbackend.adoption.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTOs for Epic 2.5 handover + adoption finalization endpoints.
 */
public class AdoptionCompletionDtos {

    private AdoptionCompletionDtos() {}

    // ── Schedule (US-2.5.1) ──────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScheduleHandoverRequest {
        @NotNull(message = "applicationId is required")
        private UUID applicationId;

        @NotNull(message = "handoverDate is required")
        @Future(message = "handoverDate must be in the future")
        private LocalDate handoverDate;

        @NotBlank(message = "handoverLocation is required")
        private String handoverLocation;
    }

    // ── Response (US-2.5.1 + US-2.5.2 + US-2.5.5) ───────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdoptionResponse {
        private UUID id;
        private UUID applicationId;
        private UUID adopterId;
        private String adopterName;
        private UUID ngoId;
        private String ngoName;
        private UUID adoptablePetId;
        private String petName;
        /** Set after confirmation (US-2.5.5). Enables deep-link to hospital module. */
        private UUID hospitalPetId;
        private String status;
        private LocalDate handoverDate;
        private String handoverLocation;
        private LocalDateTime finalizedAt;
        private LocalDateTime createdAt;
        /** Three auto-created rows after confirmHandover (US-2.5.3). */
        private List<AdoptionFollowUpDtos.FollowUpResponse> followUps;
    }
}
