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
public class CaseVerificationResponse {

    private UUID id;
    private UUID rescueMissionId;
    private ReportStatus finalStatus;
    private UUID verifiedByUserId;
    private String verifiedByUserName;
    private boolean flagged;
    private String flagNotes;
    private String auditNotes;
    private LocalDateTime closedAt;
}
