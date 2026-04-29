package com.cts.mfrp.petzbackend.hospital.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data @Builder
public class DoctorResponse {
    private UUID   id;
    private UUID   hospitalId;
    private String name;
    private String specialization;
    private String contactPhone;
    private String availability;
    @JsonProperty("isActive")
    private Boolean isActive;
    private List<UUID>   serviceIds;
    private List<String> serviceNames;
}
