package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.rescue.dto.CaseVerificationRequest;
import com.cts.mfrp.petzbackend.rescue.dto.CaseVerificationResponse;
import com.cts.mfrp.petzbackend.rescue.service.CaseVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rescue-missions")
@RequiredArgsConstructor
public class CaseVerificationController {

    private final CaseVerificationService caseVerificationService;

    // POST /api/v1/rescue-missions/{missionId}/verify — Admin verifies & closes case
    @PostMapping("/{missionId}/verify")
    public ResponseEntity<ApiResponse<CaseVerificationResponse>> verifyAndClose(
            @PathVariable UUID missionId,
            @Valid @RequestBody CaseVerificationRequest request) {

        CaseVerificationResponse response = caseVerificationService.verifyAndClose(missionId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Case verified and closed", response));
    }

    // GET /api/v1/rescue-missions/{missionId}/verification
    @GetMapping("/{missionId}/verification")
    public ResponseEntity<ApiResponse<CaseVerificationResponse>> getVerification(
            @PathVariable UUID missionId) {

        CaseVerificationResponse response = caseVerificationService.getVerificationByMissionId(missionId);
        return ResponseEntity.ok(ApiResponse.ok("Case verification fetched", response));
    }
}
