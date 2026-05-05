package com.cts.mfrp.petzbackend.rescue.dto;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueMissionResponse {

    private UUID id;
    private UUID sosReportId;
    private UUID assignedNgoUserId;
    private String assignedNgoUserName;
    private UUID assignedNgoId;
    private String assignedNgoName;
    private String ngoContactPhone;
    private String ngoContactEmail;
    private String ngoAddress;
    /** PENDING = request sent, not yet accepted. ACCEPTED/ARRIVED = NGO confirmed. */
    private String currentAssignmentStatus;
    private LocalDateTime currentAssignmentAt;
    private ReportStatus rescueStatus;
    private Integer etaMinutes;
    private LocalDateTime dispatchedAt;
    private LocalDateTime onSiteAt;
    private LocalDateTime transportingAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
