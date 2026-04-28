package com.cts.mfrp.petzbackend.adoption.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTOs for US-2.3.4 (upload) + US-2.4.6 (verify).
 */
public class KycDocumentDtos {

    private KycDocumentDtos() {}

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DocumentResponse {
        private UUID id;
        private UUID applicationId;
        private String docType;            // ID_PROOF / ADDRESS_PROOF
        private String fileUrl;
        private String fileName;
        private String verificationStatus; // PENDING / VERIFIED / REJECTED
        private UUID verifierId;
        private LocalDateTime verifiedAt;
        private String rejectionReason;
        private LocalDateTime uploadedAt;
    }

    /**
     * Body for {@code POST /{id}/documents/{docId}/verify} (US-2.4.6).
     * If {@code status=REJECTED}, a rejection reason is mandatory.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerifyRequest {
        @NotBlank(message = "status is required (VERIFIED or REJECTED)")
        private String status;
        /** Required when status=REJECTED (US-2.4.6 AC#2). */
        private String reason;
    }
}
