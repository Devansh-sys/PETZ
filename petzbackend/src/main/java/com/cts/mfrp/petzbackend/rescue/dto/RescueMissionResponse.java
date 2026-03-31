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
    private ReportStatus rescueStatus;
    private Integer etaMinutes;
    private LocalDateTime dispatchedAt;
    private LocalDateTime onSiteAt;
    private LocalDateTime transportingAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
