package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.rescue.dto.*;
import com.cts.mfrp.petzbackend.rescue.service.OnSiteRescueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * NOTE: @PreAuthorize annotations are commented out for testing.
 * Uncomment them once JWT integration with the auth module is complete.
 */
@RestController
@RequestMapping("/api/v1/rescue/{sosReportId}")
@RequiredArgsConstructor
public class OnSiteRescueController {

    private final OnSiteRescueService service;

    public OnSiteRescueController(OnSiteRescueService service) {
        this.service = service;
    }

    // US-1.4.1 — Mark Arrival
    // @PreAuthorize("hasRole('VOLUNTEER') or hasRole('NGO_REP')")
    @PatchMapping("/arrival")
    public ResponseEntity<ApiResponse<Void>> markArrival(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody ArrivalRequest req) {
        service.markArrival(sosReportId, req);
        return ResponseEntity.ok(ApiResponse.ok("Arrival marked. Status: ON_SITE.", null));
    }

    // US-1.4.2 + US-1.4.3 — On-Site Assessment + Decision
    // @PreAuthorize("hasRole('VOLUNTEER') or hasRole('NGO_REP')")
    @PostMapping("/assessment")
    public ResponseEntity<ApiResponse<OnSiteAssessmentResponse>> submitAssessment(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody OnSiteAssessmentRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok("Assessment recorded.",
                        service.submitAssessment(sosReportId, req)));
    }

    // US-1.5.1 — Get Nearby Emergency Hospitals
    // @PreAuthorize("hasRole('VOLUNTEER') or hasRole('NGO_REP')")
    @GetMapping("/hospitals/nearby")
    public ResponseEntity<ApiResponse<List<NearbyHospitalResponse>>> getNearbyHospitals(
            @PathVariable UUID sosReportId) {
        return ResponseEntity.ok(
                ApiResponse.ok("Nearby hospitals fetched.",
                        service.getNearbyEmergencyHospitals(sosReportId)));
    }

    // US-1.5.2 — Send Incoming Rescue Alert
    // @PreAuthorize("hasRole('VOLUNTEER') or hasRole('NGO_REP')")
    @PostMapping("/hospitals/{hospitalId}/alert")
    public ResponseEntity<ApiResponse<Void>> sendAlert(
            @PathVariable UUID sosReportId,
            @PathVariable UUID hospitalId) {
        service.sendIncomingRescueAlert(sosReportId, hospitalId);
        return ResponseEntity.ok(ApiResponse.ok("Incoming rescue alert sent.", null));
    }

    // US-1.5.3 — Book Emergency Slot
    // @PreAuthorize("hasRole('VOLUNTEER') or hasRole('NGO_REP')")
    @PostMapping("/booking")
    public ResponseEntity<ApiResponse<EmergencyBookingResponse>> bookSlot(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody EmergencyBookingRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok("Emergency slot booked.",
                        service.bookEmergencySlot(sosReportId, req)));
    }

    // US-1.5.4 — Record Hospital Handover
    // @PreAuthorize("hasRole('VET') or hasRole('ADMIN')")
    @PostMapping("/handover")
    public ResponseEntity<ApiResponse<HandoverResponse>> recordHandover(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody HandoverRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok("Handover recorded. Status: HANDED_OVER.",
                        service.recordHandover(sosReportId, req)));
    }

    // US-1.5.5 — Confirm Release with Photo
    // @PreAuthorize("hasRole('VOLUNTEER') or hasRole('NGO_REP')")
    @PostMapping("/release")
    public ResponseEntity<ApiResponse<Void>> confirmRelease(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody ReleaseConfirmationRequest req) {
        service.confirmRelease(sosReportId, req);
        return ResponseEntity.ok(ApiResponse.ok("Release confirmed. Case pending closure.", null));
    }
}