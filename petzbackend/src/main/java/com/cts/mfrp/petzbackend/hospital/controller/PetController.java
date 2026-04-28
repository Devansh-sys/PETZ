package com.cts.mfrp.petzbackend.hospital.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.hospital.dto.PetDtos.PetCreateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.PetDtos.PetResponse;
import com.cts.mfrp.petzbackend.hospital.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * US-3.4.3 — Select Pet for Appointment.
 *
 * GET /users/{userId}/pets   — list pets owned by user
 * POST /users/{userId}/pets  — register a new pet (the "add new pet" option)
 */
@RestController
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PetResponse>>> listPets(@PathVariable UUID userId) {
        return ResponseEntity.ok(
                ApiResponse.ok("Pets fetched.", petService.listPetsForUser(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PetResponse>> registerPet(
            @PathVariable UUID userId,
            @Valid @RequestBody PetCreateRequest request) {
        PetResponse created = petService.registerPet(userId, request);
        return ResponseEntity.ok(
                ApiResponse.ok("Pet registered.", created));
    }
}
