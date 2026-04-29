package com.cts.mfrp.petzbackend.hospital.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data @Builder
public class ServiceResponse {
    private UUID       id;
    private UUID       hospitalId;
    private String     serviceName;
    private String     description;
    private String     serviceType;
    private BigDecimal price;
    private boolean    emergencyDedicated;
    private boolean    active;
}
