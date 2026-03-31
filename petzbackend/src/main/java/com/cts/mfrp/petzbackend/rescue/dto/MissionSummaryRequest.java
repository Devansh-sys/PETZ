package com.cts.mfrp.petzbackend.rescue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissionSummaryRequest {

    @NotNull(message = "Submitted by user ID is required")
    private UUID submittedByUserId;

    @NotBlank(message = "Outcome is required")
    @Size(max = 1000, message = "Outcome cannot exceed 1000 characters")
    private String outcome;

    @Size(max = 2000, message = "Timeline cannot exceed 2000 characters")
    private String timeline;

    @Size(max = 2000, message = "Notes cannot exceed 2000 characters")
    private String notes;
}
