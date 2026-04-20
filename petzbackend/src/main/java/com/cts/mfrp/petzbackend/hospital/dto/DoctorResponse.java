
// ─────────────────────────────────────────────
// FILE 11: hospital/dto/DoctorResponse.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Response shape for a doctor.
 * Extended in Epic 3.2 with hospitalId, contactPhone, isActive and the
 * linked service IDs/names (US-3.2.3 AC#3). Older consumers that only
 * read id/name/specialization/availability still work unchanged.
 */
@Data @Builder
public class DoctorResponse {
    private UUID   id;
    private UUID   hospitalId;
    private String name;
    private String specialization;
    private String contactPhone;
    private String availability;
    private Boolean isActive;
    /** IDs of the hospital services this doctor offers (US-3.2.3 AC#3). */
    private List<UUID>   serviceIds;
    private List<String> serviceNames;
}
