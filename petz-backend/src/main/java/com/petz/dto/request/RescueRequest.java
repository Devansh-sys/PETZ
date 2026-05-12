package com.petz.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class RescueRequest {
    private String animalType;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
    private String criticality;   // LOW, MEDIUM, HIGH, CRITICAL
    private String reporterPhone; // Required — 10-digit Indian mobile number
}
