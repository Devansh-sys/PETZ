
// ============================================================
// FILE 13: rescue/dto/OnSiteAssessmentRequest.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.dto;

import com.cts.mfrp.petzbackend.rescue.model.OnSiteAssessment.AssessmentDecision;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class OnSiteAssessmentRequest {

    @NotNull
    private UUID volunteerId;

    @NotBlank
    private String animalCondition;

    private String injuryDescription;

    @NotNull
    private AssessmentDecision decision;

    @NotBlank
    private String decisionJustification;
}
