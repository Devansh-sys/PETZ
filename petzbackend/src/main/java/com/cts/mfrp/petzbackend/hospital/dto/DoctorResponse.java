
// ─────────────────────────────────────────────
// FILE 11: hospital/dto/DoctorResponse.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data @Builder
public class DoctorResponse {
    private UUID   id;
    private String name;
    private String specialization;
    private String availability;
}
