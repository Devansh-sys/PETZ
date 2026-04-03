package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.rescue.dto.RescueMissionResponse;
import com.cts.mfrp.petzbackend.rescue.dto.RescueStatusUpdateRequest;
import com.cts.mfrp.petzbackend.rescue.service.RescueTrackingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rescue-missions")
@RequiredArgsConstructor
public class RescueTrackingController {

    private final RescueTrackingService rescueTrackingService;

    // POST /api/v1/rescue-missions?sosReportId={id} creating mission
    @PostMapping
    public ResponseEntity<ApiResponse<RescueMissionResponse>> createMission(
            @RequestParam UUID sosReportId) {

        RescueMissionResponse response = rescueTrackingService.createMission(sosReportId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Rescue mission created", response));
    }

    // PUT /api/v1/rescue-missions/{missionId}/status
    @PutMapping("/{missionId}/status")
    public ResponseEntity<ApiResponse<RescueMissionResponse>> updateStatus(
            @PathVariable UUID missionId,
            @Valid @RequestBody RescueStatusUpdateRequest request) {

        RescueMissionResponse response = rescueTrackingService.updateStatus(missionId, request);
        return ResponseEntity.ok(ApiResponse.ok("Status updated", response));
    }

    // GET /api/v1/rescue-missions/{missionId} — Reporter reads live status
    @GetMapping("/{missionId}")
    public ResponseEntity<ApiResponse<RescueMissionResponse>> getMission(
            @PathVariable UUID missionId) {

        RescueMissionResponse response = rescueTrackingService.getMissionById(missionId);
        return ResponseEntity.ok(ApiResponse.ok("Mission fetched", response));
    }

    // GET /api/v1/rescue-missions/by-report/{sosReportId} — Reporter tracks by SOS report
    @GetMapping("/by-report/{sosReportId}")
    public ResponseEntity<ApiResponse<RescueMissionResponse>> getMissionBySosReport(
            @PathVariable UUID sosReportId) {

        RescueMissionResponse response = rescueTrackingService.getMissionBySosReportId(sosReportId);
        return ResponseEntity.ok(ApiResponse.ok("Mission fetched", response));
    }

    // GET /api/v1/rescue-missions?status={status} listing mission by their status
    @GetMapping
    public ResponseEntity<ApiResponse<List<RescueMissionResponse>>> getMissionsByStatus(
            @RequestParam(required = false) ReportStatus status) {

        List<RescueMissionResponse> responses = (status != null)
                ? rescueTrackingService.getMissionsByStatus(status)
                : rescueTrackingService.getMissionsByStatus(null);
        return ResponseEntity.ok(ApiResponse.ok("Missions fetched", responses));
    }
}
