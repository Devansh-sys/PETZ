package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HospitalVerificationRequest {

    @NotNull(message = "Action is required")
    private VerifyAction action;

    private String reason;

    public enum VerifyAction {
        APPROVE, REJECT, SUSPEND
    }
}
