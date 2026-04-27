package com.cts.mfrp.petzbackend.ngo.dto;

import java.util.List;
import java.util.UUID;

public class AssignResponseDTO {

    private UUID missionId;
    private String ngoStatus;
    private List<NgoResponseDTO> nearbyNgos;

    public AssignResponseDTO(UUID missionId, String ngoStatus, List<NgoResponseDTO> nearbyNgos) {
        this.missionId = missionId;
        this.ngoStatus = ngoStatus;
        this.nearbyNgos = nearbyNgos;
    }

    public UUID getMissionId() { return missionId; }
    public String getNgoStatus() { return ngoStatus; }
    public List<NgoResponseDTO> getNearbyNgos() { return nearbyNgos; }
}
