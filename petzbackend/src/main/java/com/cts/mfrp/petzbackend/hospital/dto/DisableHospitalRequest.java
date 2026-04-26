package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DisableHospitalRequest {

    @NotBlank(message = "Reason is required when disabling a hospital")
    private String reason;
}
