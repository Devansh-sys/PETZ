package com.cts.mfrp.petzbackend.adoption.dto;

import com.cts.mfrp.petzbackend.adoption.enums.AdoptionApplicationStatus;
import com.cts.mfrp.petzbackend.adoption.enums.AuditTargetType;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionAuditLog;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTOs for Epic 2.6 admin endpoints (metrics + NGO verification).
 */
public class AdoptionAdminDtos {

    private AdoptionAdminDtos() {}

    // ── US-2.6.1 metrics response ───────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricsResponse {
        private long totalApplications;
        private long approvedCount;
        private long rejectedCount;
        private long withdrawnCount;
        private long completedAdoptions;
        /** AC#1 "conversion rate" = APPROVED / SUBMITTED (+ decided). */
        private double conversionRatePercent;
        /** AC#1 "completion rate" = COMPLETED / APPROVED. */
        private double completionRatePercent;
        /** AC#1 "avg review time" — hours between SUBMITTED and decision. */
        private Double avgReviewTimeHours;
        /** AC#1 "follow-up compliance" = COMPLETED / (due_before_today follow-ups). */
        private double followUpCompliancePercent;
        private long totalFollowUps;
        private long completedFollowUps;
        private long flaggedFollowUps;
    }

    // ── US-2.6.2 NGO verification ───────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerifyNgoRequest {
        /** APPROVE / REJECT / SUSPEND (US-2.6.2 AC#2). */
        @NotBlank(message = "action is required (APPROVE | REJECT | SUSPEND)")
        private String action;
        private String reason;
        /**
         * Optional link to an NGO_REP user when approving. Admin can
         * also pass this later via a separate endpoint; leaving it here
         * keeps the verify flow self-contained.
         */
        private UUID ownerUserId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NgoResponse {
        private UUID id;
        private String name;
        private double latitude;
        private double longitude;
        private boolean active;
        private boolean isVerified;
        private UUID ownerUserId;
    }

    // ── US-4.3 unified audit log ───────────────────────────────────────

    /**
     * Single audit-log row returned by GET /admin/adoptions/audit-logs.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuditLogResponse {
        private UUID            id;
        private AuditTargetType targetType;
        private UUID            targetId;
        private UUID            actorId;
        private String          action;
        private String          reason;
        private String          metadata;
        private LocalDateTime   performedAt;

        public static AuditLogResponse from(AdoptionAuditLog log) {
            return AuditLogResponse.builder()
                    .id(log.getId())
                    .targetType(log.getTargetType())
                    .targetId(log.getTargetId())
                    .actorId(log.getActorId())
                    .action(log.getAction())
                    .reason(log.getReason())
                    .metadata(log.getMetadata())
                    .performedAt(log.getPerformedAt())
                    .build();
        }
    }

    // ── Admin: list all applications ─────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApplicationSummary {
        private UUID id;
        private UUID adopterId;
        private UUID adoptablePetId;
        private UUID ngoId;
        private String ngoName;
        private AdoptionApplicationStatus status;
        private String fullName;
        private String phone;
        private String email;
        private String city;
        private String housingType;
        private Boolean prevPetOwnership;
        private Boolean consentHomeVisit;
        private Boolean consentFollowUp;
        private Boolean consentBackgroundCheck;
        private String decisionReason;
        private LocalDateTime submittedAt;
        private LocalDateTime createdAt;
        private LocalDateTime decidedAt;
    }

    // ── Admin: direct approve/reject ────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ApplicationDecideRequest {
        @NotBlank(message = "action is required (APPROVE | REJECT)")
        private String action;
        private String reason;
    }

    // ── Admin: add NGO representative ───────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AddNgoRepresentativeRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;
        @NotBlank(message = "Phone is required")
        private String phone;
        private String email;
        @NotBlank(message = "Password is required")
        private String password;
    }
}
