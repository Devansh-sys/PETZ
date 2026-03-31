

// ============================================================
// FILE 14: rescue/dto/OnSiteAssessmentResponse.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.dto;

import com.cts.mfrp.petzbackend.rescue.model.OnSiteAssessment.AssessmentDecision;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class OnSiteAssessmentResponse {

    private UUID assessmentId;
    private UUID sosReportId;
    private AssessmentDecision decision;
    private String animalCondition;
    private LocalDateTime assessedAt;
    // "HOSPITAL_SELECTION" | "RELEASE_CONFIRMATION" | "CANNOT_LOCATE"
    private String nextStep;
}
