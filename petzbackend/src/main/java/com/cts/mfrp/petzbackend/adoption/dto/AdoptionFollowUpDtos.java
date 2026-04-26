package com.cts.mfrp.petzbackend.adoption.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTOs for US-2.5.3 + US-2.5.4 post-adoption follow-up endpoints.
 */
public class AdoptionFollowUpDtos {

    private AdoptionFollowUpDtos() {}

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FollowUpResponse {
        private UUID id;
        private UUID adoptionId;
        private String followUpType;  // DAY_7 / DAY_30 / DAY_90
        private LocalDate dueDate;
        private String status;        // SCHEDULED / COMPLETED / FLAGGED
        private String notes;
        private boolean concernFlag;
        private LocalDateTime completedAt;
        private UUID completedBy;
        private LocalDateTime reminderSentAt;
        private LocalDateTime createdAt;
    }

    /**
     * Body for {@code PATCH /adoptions/{id}/follow-ups/{followUpId}} (US-2.5.4).
     * If {@code status=FLAGGED}, concernFlag is auto-set to true.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecordFollowUpRequest {
        @NotBlank(message = "status is required (COMPLETED or FLAGGED)")
        private String status;
        private String notes;
        private Boolean concernFlag;
    }
}
