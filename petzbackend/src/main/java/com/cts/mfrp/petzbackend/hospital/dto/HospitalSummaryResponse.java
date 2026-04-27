
// ─────────────────────────────────────────────
// FILE 13: hospital/dto/HospitalSummaryResponse.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.dto;

<<<<<<< Updated upstream
=======
import com.fasterxml.jackson.annotation.JsonProperty;
>>>>>>> Stashed changes
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data @Builder
public class HospitalSummaryResponse {
    private UUID    id;
    private String  name;
    private String  address;
    private String  city;
    private String  contactPhone;
    private String  operatingHours;
    private boolean emergencyReady;
<<<<<<< Updated upstream
    private boolean isOpenNow;
=======
    @JsonProperty("isOpenNow")
    private boolean isOpenNow;
    @JsonProperty("isVerified")
>>>>>>> Stashed changes
    private boolean isVerified;
    private double  distanceKm;
    private int     serviceCount;
}
