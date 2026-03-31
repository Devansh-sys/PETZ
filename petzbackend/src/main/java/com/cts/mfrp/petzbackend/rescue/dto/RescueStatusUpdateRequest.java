package com.cts.mfrp.petzbackend.rescue.dto;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueStatusUpdateRequest {

    @NotNull(message = "New status is required")
    private ReportStatus newStatus;

    private UUID assignedNgoUserId;

    private Integer etaMinutes;
}
