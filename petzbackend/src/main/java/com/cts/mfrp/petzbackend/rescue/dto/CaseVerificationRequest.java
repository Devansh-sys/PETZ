package com.cts.mfrp.petzbackend.rescue.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseVerificationRequest {

    @NotNull(message = "Admin user ID is required")
    private UUID adminUserId;

    private boolean flagged;

    @Size(max = 1000, message = "Flag notes cannot exceed 1000 characters")
    private String flagNotes;

    @Size(max = 2000, message = "Audit notes cannot exceed 2000 characters")
    private String auditNotes;
}
