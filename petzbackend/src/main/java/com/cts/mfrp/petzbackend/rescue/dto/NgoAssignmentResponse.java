package com.cts.mfrp.petzbackend.rescue.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NgoAssignmentResponse {
    private UUID   assignmentId;
    private UUID   sosReportId;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String urgencyLevel;
    private String sosStatus;
    private String assignmentStatus;
    private String reporterName;
    private String reporterPhone;
    private LocalDateTime reportedAt;
    private LocalDateTime assignedAt;
}
