package com.cts.mfrp.petzbackend.adoption.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTOs for US-2.2.3 "Manage Pet Media Gallery".
 */
public class AdoptionMediaDtos {

    private AdoptionMediaDtos() {}

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MediaResponse {
        private UUID id;
        private UUID adoptablePetId;
        private String fileUrl;
        private String fileName;
        private String mediaType;      // IMAGE / VIDEO
        private int displayOrder;
        private boolean isPrimary;
        private LocalDateTime uploadedAt;
    }

    /** PATCH /{petId}/media/order — full-replacement reorder. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReorderRequest {
        @NotNull(message = "order is required")
        @NotEmpty(message = "order list cannot be empty")
        private List<UUID> order;
    }
}
