package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;
import java.util.UUID;

/**
 * DTOs for US-3.2.3 — "Manage Doctor Profiles".
 *   - create: AC#1 "Add"
 *   - update: AC#1 "edit"
 *   - delete: AC#1 "remove"  (implemented as soft-delete -> isActive=false)
 *   - link services: AC#3 "Linked to services"
 */
public class DoctorManagementDtos {

    private DoctorManagementDtos() {}

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorCreateRequest {
        @NotBlank(message = "Doctor name is required")
        private String name;
        private String specialization;
        private String contactPhone;
        /** Free-text weekly availability summary (US-3.2.3 AC#2). */
        private String availability;
        /** Optional — IDs of initial services the doctor offers (US-3.2.3 AC#3). */
        private List<UUID> serviceIds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorUpdateRequest {
        private String name;
        private String specialization;
        private String contactPhone;
        private String availability;
        private Boolean isActive;
    }

    /** PUT replacement of the doctor's linked services set. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorServicesLinkRequest {
        private List<UUID> serviceIds;
    }
}
