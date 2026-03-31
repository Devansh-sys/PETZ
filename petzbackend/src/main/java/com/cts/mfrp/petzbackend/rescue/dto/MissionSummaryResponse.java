package com.cts.mfrp.petzbackend.rescue.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionSummaryResponse {

    private UUID id;
    private UUID rescueMissionId;
    private String outcome;
    private String timeline;
    private String notes;
    private UUID submittedByUserId;
    private String submittedByUserName;
    private LocalDateTime submittedAt;
}
