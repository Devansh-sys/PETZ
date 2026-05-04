package com.cts.mfrp.petzbackend.sosreport.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.sosreport.dto.SosReportCreateRequest;
import com.cts.mfrp.petzbackend.sosreport.dto.SosReportResponse;
import com.cts.mfrp.petzbackend.sosreport.service.SosReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sos-reports")
@RequiredArgsConstructor
public class SosReportController {

    private final SosReportService sosReportService;

    // POST /api/v1/sos-reports
    // User Story 1 (Triage) + User Story 3 (Notes)
    @PostMapping
    public ResponseEntity<ApiResponse<SosReportResponse>> createReport(
            @Valid @RequestBody SosReportCreateRequest request) {

        SosReportResponse response = sosReportService.createReport(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok("SOS Report created successfully", response));
    }

    // POST /api/v1/sos-reports/{reportId}/media
    // User Story 2 (Photo/Video Evidence)
    @PostMapping(value = "/{reportId}/media",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<SosReportResponse>> uploadMedia(
            @PathVariable UUID reportId,
            @RequestParam("files") List<MultipartFile> files) {

        SosReportResponse response = sosReportService.uploadMedia(reportId, files);
        return ResponseEntity.ok(
                ApiResponse.ok("Media uploaded successfully", response));
    }

    // GET /api/v1/sos-reports/{reportId}
    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<SosReportResponse>> getReport(
            @PathVariable UUID reportId) {

        SosReportResponse response = sosReportService.getReportById(reportId);
        return ResponseEntity.ok(ApiResponse.ok("Report fetched", response));
    }

    // GET /api/v1/sos-reports
    @GetMapping
    public ResponseEntity<ApiResponse<List<SosReportResponse>>> getAllReports() {
        List<SosReportResponse> reports = sosReportService.getAllReports();
        return ResponseEntity.ok(ApiResponse.ok("Reports fetched", reports));
    }

    // GET /api/v1/sos-reports/my-reports?reporterId=<uuid>
    @GetMapping("/my-reports")
    public ResponseEntity<ApiResponse<List<SosReportResponse>>> getMyReports(
            @RequestParam UUID reporterId) {

        List<SosReportResponse> reports = sosReportService.getReportsByReporter(reporterId);
        return ResponseEntity.ok(ApiResponse.ok("Reporter's reports fetched", reports));
    }

    // PATCH /api/v1/sos-reports/{reportId}/status — NGO accepts or rejects a report
    @PatchMapping("/{reportId}/status")
    public ResponseEntity<ApiResponse<SosReportResponse>> updateStatus(
            @PathVariable UUID reportId,
            @RequestBody Map<String, String> body) {

        ReportStatus status = ReportStatus.valueOf(body.get("status").trim().toUpperCase());
        SosReportResponse response = sosReportService.updateStatus(reportId, status);
        return ResponseEntity.ok(ApiResponse.ok("Status updated to " + status, response));
    }
}