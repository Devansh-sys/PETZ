
// ─────────────────────────────────────────────
// FILE 22: hospital/controller/HospitalDiscoveryController.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.hospital.dto.*;
import com.cts.mfrp.petzbackend.hospital.service.HospitalDiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hospitals")
@RequiredArgsConstructor
public class HospitalDiscoveryController {

    private final HospitalDiscoveryService service;

    // US-3.1.1 — Browse all verified hospitals
    // GET /api/v1/hospitals?lat=13.0827&lon=80.2707
    @GetMapping
    public ResponseEntity<ApiResponse<List<HospitalSummaryResponse>>> getAllHospitals(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Hospitals fetched.", service.getAllHospitals(lat, lon)));
    }

    // US-3.1.2 — Filter and search hospitals
    // GET /api/v1/hospitals/search?name=Apollo&emergencyReady=true&openNow=true
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<HospitalSummaryResponse>>> filterHospitals(
            @RequestParam(required = false) String  name,
            @RequestParam(required = false) String  city,
            @RequestParam(required = false) String  serviceType,
            @RequestParam(required = false) Boolean emergencyReady,
            @RequestParam(required = false) Boolean openNow,
            @RequestParam(required = false) Double  lat,
            @RequestParam(required = false) Double  lon) {

        HospitalFilterRequest filter = new HospitalFilterRequest();
        filter.setName(name);
        filter.setCity(city);
        filter.setServiceType(serviceType);
        filter.setEmergencyReady(emergencyReady);
        filter.setOpenNow(openNow);
        filter.setUserLatitude(lat);
        filter.setUserLongitude(lon);

        return ResponseEntity.ok(ApiResponse.ok(
                "Hospitals filtered.", service.filterHospitals(filter)));
    }

    // US-3.1.3 — View hospital profile
    // GET /api/v1/hospitals/{hospitalId}?lat=13.0827&lon=80.2707
    @GetMapping("/{hospitalId}")
    public ResponseEntity<ApiResponse<HospitalProfileResponse>> getHospitalProfile(
            @PathVariable UUID hospitalId,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Hospital profile fetched.",
                service.getHospitalProfile(hospitalId, lat, lon)));
    }
}

