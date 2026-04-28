package com.cts.mfrp.petzbackend.adoption.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTOs for US-2.6.3 admin dispute queue.
 */
public class AdoptionDisputeDtos {

    private AdoptionDisputeDtos() {}

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RaiseDisputeRequest {
        @NotNull(message = "adoptionId is required")
        private UUID adoptionId;
        @NotBlank(message = "description is required")
        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResolveDisputeRequest {
        /** OVERRIDE / WARN / SUSPEND (US-2.6.3 AC#3). */
        @NotBlank(message = "action is required (OVERRIDE | WARN | SUSPEND)")
        private String action;
        @NotBlank(message = "resolution is required")
        private String resolution;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DisputeResponse {
        private UUID id;
        private UUID adoptionId;
        private UUID raisedByUserId;
        private String description;
        private String status;
        private String adminAction;
        private String resolution;
        private UUID resolvedBy;
        private LocalDateTime resolvedAt;
        private LocalDateTime createdAt;
    }
}
