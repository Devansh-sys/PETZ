package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.rescue.dto.MissionSummaryRequest;
import com.cts.mfrp.petzbackend.rescue.dto.MissionSummaryResponse;
import com.cts.mfrp.petzbackend.rescue.service.MissionClosureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rescue-missions")
@RequiredArgsConstructor
public class MissionClosureController {

    private final MissionClosureService missionClosureService;

    // POST /api/v1/rescue-missions/{missionId}/summary — NGO submits mission summary
    @PostMapping("/{missionId}/summary")
    public ResponseEntity<ApiResponse<MissionSummaryResponse>> submitSummary(
            @PathVariable UUID missionId,
            @Valid @RequestBody MissionSummaryRequest request) {

        MissionSummaryResponse response = missionClosureService.submitSummary(missionId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Mission summary submitted. Status set to MISSION_COMPLETE", response));
    }

    // GET /api/v1/rescue-missions/{missionId}/summary
    @GetMapping("/{missionId}/summary")
    public ResponseEntity<ApiResponse<MissionSummaryResponse>> getSummary(
            @PathVariable UUID missionId) {

        MissionSummaryResponse response = missionClosureService.getSummaryByMissionId(missionId);
        return ResponseEntity.ok(ApiResponse.ok("Mission summary fetched", response));
    }
}
