
// ============================================================
// FILE 20: rescue/dto/ReleaseConfirmationRequest.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ReleaseConfirmationRequest {

    @NotNull
    private UUID volunteerId;

    @NotBlank
    private String releasePhotoUrl;

    private String releaseNotes;
}