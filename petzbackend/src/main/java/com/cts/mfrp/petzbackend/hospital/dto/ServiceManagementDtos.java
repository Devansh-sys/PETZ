package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

/**
 * DTOs for US-3.2.2 — "Manage Hospital Services" (CRUD with pricing).
 * Each service is name + type + price (AC#2).
 */
public class ServiceManagementDtos {

    private ServiceManagementDtos() {}

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceCreateRequest {
        @NotBlank(message = "Service name is required")
        private String serviceName;

        /** Must match {@code HospitalService.ServiceType} enum. */
        @NotBlank(message = "Service type is required")
        private String serviceType;

        @DecimalMin(value = "0.0", inclusive = true, message = "price must be ≥ 0")
        private BigDecimal price;
    }

    /** Partial-update shape. Null fields are ignored — only provided ones change. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceUpdateRequest {
        private String serviceName;
        private String serviceType;
        @DecimalMin(value = "0.0", inclusive = true, message = "price must be ≥ 0")
        private BigDecimal price;
    }
}
