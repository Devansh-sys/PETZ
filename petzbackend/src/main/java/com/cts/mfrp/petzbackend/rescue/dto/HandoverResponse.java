



// ============================================================
// FILE 19: rescue/dto/HandoverResponse.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class HandoverResponse {

    private UUID handoverId;
    private UUID sosReportId;
    private UUID hospitalId;
    private LocalDateTime handoverAt;
    private String rescueStatus;
}
