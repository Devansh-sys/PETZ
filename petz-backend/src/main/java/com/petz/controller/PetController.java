package com.petz.controller;

import com.petz.dto.request.PetRequest;
import com.petz.entity.Pet;
import com.petz.service.PetService;
import com.petz.util.ApiResponse;
import com.petz.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;
    private final SecurityUtil securityUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<Pet>> addPet(@RequestBody PetRequest req) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(petService.addPet(userId, req), "Pet added."));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Pet>>> myPets() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(petService.getByOwner(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Pet>> getPet(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(petService.getPet(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Pet>> updatePet(@PathVariable Long id, @RequestBody PetRequest req) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(petService.updatePet(id, userId, req), "Pet updated."));
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<ApiResponse<Pet>> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(petService.uploadPhoto(id, userId, file), "Photo uploaded."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePet(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        petService.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Pet deleted."));
    }
}
