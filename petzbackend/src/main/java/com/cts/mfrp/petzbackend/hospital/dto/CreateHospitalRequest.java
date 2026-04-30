package com.cts.mfrp.petzbackend.hospital.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateHospitalRequest {
    @NotBlank(message = "Hospital name is required")
    private String name;
    @NotBlank(message = "Address is required")
    private String address;
    @NotBlank(message = "City is required")
    private String city;
    private String contactPhone;
    private String contactEmail;
    private String operatingHours;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private boolean emergencyReady;
}
