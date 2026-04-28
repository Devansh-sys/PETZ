package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * US-3.2.1 — "Register Hospital on Platform".
 * Form fields required by AC#1: name, address, GPS, contact, hours,
 * services, emergency flag. Submitted by a hospital admin to create a
 * PENDING hospital record (AC#3); a platform admin then verifies it via
 * the existing {@code /admin/hospitals/{id}/verify} endpoint.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalRegistrationRequest {

    /** FK to the authenticated hospital admin user. Dev flow passes it in
     *  the body; wire it from JWT subject when auth is tightened. */
    @NotNull(message = "ownerId is required")
    private UUID ownerId;

    @NotBlank(message = "Hospital name is required")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String contactPhone;

    @Email(message = "contactEmail must be a valid email")
    private String contactEmail;

    // ── AC#1: GPS ─────────────────────────────────────────────────────
    @DecimalMin(value = "-90.0",  message = "latitude must be ≥ -90")
    @DecimalMax(value = "90.0",   message = "latitude must be ≤ 90")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "longitude must be ≥ -180")
    @DecimalMax(value = "180.0",  message = "longitude must be ≤ 180")
    private BigDecimal longitude;

    // ── AC#1: hours (either structured OR free-text) ─────────────────
    /** Structured per-day hours. If provided, overrides operatingHoursText. */
    @Valid
    private OperatingHoursDto operatingHours;

    /** Optional free-text fallback (e.g. "Mon-Fri 9AM-5PM"). */
    private String operatingHoursText;

    // ── AC#1: emergency flag ─────────────────────────────────────────
    /** Boxed so omitting it from the body is allowed; defaults to false
     *  in {@code HospitalProfileService.registerHospital}. Spring Boot 4's
     *  Jackson fails on primitives when the JSON field is missing/null. */
    private Boolean emergencyReady;

    /** Optional: initial services submitted with the registration form. */
    @Valid
    private List<InitialService> services;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InitialService {
        @NotBlank(message = "Service name is required")
        private String serviceName;
        /** Must match {@code HospitalService.ServiceType} enum values. */
        @NotBlank(message = "Service type is required")
        private String serviceType;
        private BigDecimal price;
    }
}
