package com.petz.controller;

import com.petz.dto.request.RescueRequest;
import com.petz.entity.RescueReport;
import com.petz.service.RescueService;
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
@RequestMapping("/rescue")
@RequiredArgsConstructor
public class RescueController {

    private final RescueService rescueService;
    private final SecurityUtil securityUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<RescueReport>> submit(
            @RequestPart("data") RescueRequest req,
            @RequestPart(value = "photo", required = false) MultipartFile photo) throws IOException {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(rescueService.submitRescue(userId, req, photo), "Rescue submitted."));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RescueReport>>> myReports() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(rescueService.getByReporter(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RescueReport>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(rescueService.getById(id)));
    }

    // NGO endpoints
    @GetMapping("/ngo")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<List<RescueReport>>> ngoRescues() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(rescueService.getByNgo(userId)));
    }

    @PostMapping("/{id}/respond")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<RescueReport>> respond(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(
                rescueService.respondToQueue(id, userId, body.get("response")), "Response recorded."));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<ApiResponse<RescueReport>> complete(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(
                rescueService.complete(id, userId, body.get("notes")), "Rescue completed."));
    }
}
