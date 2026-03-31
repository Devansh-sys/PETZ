package com.cts.mfrp.petzbackend.sosreport.dto;

import com.cts.mfrp.petzbackend.enums.UrgencyLevel;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SosReportCreateRequest {

    @NotNull(message = "Reporter ID is required")
    private UUID reporterId;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private BigDecimal latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private BigDecimal longitude;

    // USER STORY 1: Mandatory urgency selection
    @NotNull(message = "Urgency level is required. Choose: CRITICAL, MODERATE, or LOW")
    private UrgencyLevel urgencyLevel;

    // USER STORY 3: Optional description, max 500 chars
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
}
