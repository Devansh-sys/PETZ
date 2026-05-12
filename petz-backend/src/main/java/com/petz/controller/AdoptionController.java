package com.petz.controller;

import com.petz.dto.request.AdoptionApplicationRequest;
import com.petz.dto.request.AnimalRequest;
import com.petz.dto.response.AdoptionApplicationResponse;
import com.petz.entity.AdoptableAnimal;
import com.petz.entity.AdoptionApplication;
import com.petz.service.AdoptionService;
import com.petz.util.ApiResponse;
import com.petz.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/adoption")
@RequiredArgsConstructor
public class AdoptionController {

    private final AdoptionService adoptionService;
    private final SecurityUtil securityUtil;

    // ── Public browse ─────────────────────────────────────────────────

    @GetMapping("/animals")
    public ResponseEntity<ApiResponse<List<AdoptableAnimal>>> browse(
            @RequestParam(required = false) String species,
            @RequestParam(required = false) String city) {
        return ResponseEntity.ok(ApiResponse.ok(adoptionService.browseAnimals(species, city)));
    }

    @GetMapping("/animals/{id}")
    public ResponseEntity<ApiResponse<AdoptableAnimal>> getAnimal(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(adoptionService.getAnimalById(id)));
    }

    // ── NGO animal management ─────────────────────────────────────────

    @PostMapping("/ngo/animals")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<AdoptableAnimal>> addAnimal(@RequestBody AnimalRequest req) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(adoptionService.addAnimal(userId, req), "Animal added."));
    }

    @PutMapping("/ngo/animals/{id}")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<AdoptableAnimal>> updateAnimal(
            @PathVariable Long id, @RequestBody AnimalRequest req) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(adoptionService.updateAnimal(id, userId, req), "Animal updated."));
    }

    @PostMapping("/ngo/animals/{id}/photo")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<AdoptableAnimal>> uploadPhoto(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) throws IOException {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(adoptionService.uploadAnimalPhoto(id, userId, file), "Photo uploaded."));
    }

    @GetMapping("/ngo/animals")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<List<AdoptableAnimal>>> ngoAnimals() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(adoptionService.getByNgo(userId)));
    }

    @DeleteMapping("/ngo/animals/{id}")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<Void>> deleteAnimal(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        adoptionService.deleteAnimal(id, userId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Animal removed."));
    }

    // ── Adoption applications ─────────────────────────────────────────

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<AdoptionApplication>> apply(
            @RequestBody AdoptionApplicationRequest req) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(adoptionService.apply(userId, req), "Application submitted."));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<ApiResponse<List<AdoptionApplicationResponse>>> myApplications() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(adoptionService.getApplicationsByUser(userId)));
    }

    @GetMapping("/ngo/applications")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<List<AdoptionApplicationResponse>>> ngoApplications() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(adoptionService.getApplicationsByNgo(userId)));
    }

    @PatchMapping("/ngo/applications/{id}/review")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<AdoptionApplication>> review(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(
                adoptionService.reviewApplication(id, userId, body.get("status"), body.get("notes")),
                "Application reviewed."));
    }
}
