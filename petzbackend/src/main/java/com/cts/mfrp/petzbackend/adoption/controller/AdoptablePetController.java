package com.cts.mfrp.petzbackend.adoption.controller;

import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.Detail;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.FilterRequest;
import com.cts.mfrp.petzbackend.adoption.dto.AdoptablePetDtos.Summary;
import com.cts.mfrp.petzbackend.adoption.dto.PageResponse;
import com.cts.mfrp.petzbackend.adoption.service.AdoptablePetService;
import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Epic 2.1 — public adoption catalog (no auth required).
 *
 *   GET /api/v1/adoptable-pets        — US-2.1.1 browse with pagination + sort
 *   GET /api/v1/adoptable-pets/search — US-2.1.2 multi-filter search
 *   GET /api/v1/adoptable-pets/{id}   — US-2.1.4 full profile
 */
@RestController
@RequestMapping("/api/v1/adoptable-pets")
@RequiredArgsConstructor
public class AdoptablePetController {

    private final AdoptablePetService service;

    // US-2.1.1 + US-2.1.3 — catalog view with sort + pagination
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<Summary>>> browse(
            @RequestParam(required = false) String sort,       // newest | nearest | ready
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lon,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<Summary> data = service.browse(null, sort, lat, lon, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Adoptable pets fetched.", data));
    }

    // US-2.1.2 — filtered search. Same shape as browse; separate path kept
    // so clients can tell "open catalog" from "filtered search" for analytics.
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<Summary>>> search(
            @RequestParam(required = false) String  species,
            @RequestParam(required = false) String  breed,
            @RequestParam(required = false) String  gender,
            @RequestParam(required = false) Integer minAgeMonths,
            @RequestParam(required = false) Integer maxAgeMonths,
            @RequestParam(required = false) String  city,
            @RequestParam(required = false) Boolean vaccinated,
            @RequestParam(required = false) Boolean specialNeeds,
            @RequestParam(required = false) Boolean adoptionReady,
            @RequestParam(required = false) String  sort,
            @RequestParam(required = false) Double  lat,
            @RequestParam(required = false) Double  lon,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        FilterRequest filter = FilterRequest.builder()
                .species(species).breed(breed).gender(gender)
                .minAgeMonths(minAgeMonths).maxAgeMonths(maxAgeMonths)
                .city(city).vaccinated(vaccinated)
                .specialNeeds(specialNeeds).adoptionReady(adoptionReady)
                .build();

        PageResponse<Summary> data = service.browse(filter, sort, lat, lon, page, size);
        return ResponseEntity.ok(ApiResponse.ok("Filter applied.", data));
    }

    // US-2.1.4 — full profile
    @GetMapping("/{petId}")
    public ResponseEntity<ApiResponse<Detail>> detail(@PathVariable UUID petId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Adoptable pet profile fetched.", service.getDetail(petId)));
    }
}
