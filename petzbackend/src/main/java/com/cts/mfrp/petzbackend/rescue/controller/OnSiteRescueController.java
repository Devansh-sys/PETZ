
// ============================================================
// FILE 24: rescue/controller/OnSiteRescueController.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.common.dto.ApiResponse;
import com.cts.mfrp.petzbackend.rescue.dto.*;
import com.cts.mfrp.petzbackend.rescue.service.OnSiteRescueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

        import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rescue/{sosReportId}")
@RequiredArgsConstructor
public class OnSiteRescueController {

    private final OnSiteRescueService service;

//     US-1.4.1 — Mark Arrival
    @PatchMapping("/arrival")
    @PreAuthorize("hasRole('NGO_REP')")
    public ResponseEntity<ApiResponse<Void>> markArrival(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody ArrivalRequest req) {
        service.markArrival(sosReportId, req);
        return ResponseEntity.ok(ApiResponse.ok("Arrival marked. Status: ON_SITE.", null));
    }

    // US-1.4.2 + US-1.4.3 — On-Site Assessment + Decision //it is to record the assessment
    @PostMapping("/assessment")
    @PreAuthorize("hasRole('NGO_REP')")
    public ResponseEntity<ApiResponse<OnSiteAssessmentResponse>> submitAssessment(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody OnSiteAssessmentRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok("Assessment recorded.",
                        service.submitAssessment(sosReportId, req)));
    }

    // US-1.5.1 — Get Nearby Emergency Hospitals
    @GetMapping("/hospitals/nearby")
    @PreAuthorize("hasRole('NGO_REP')")
    public ResponseEntity<ApiResponse<List<NearbyHospitalResponse>>> getNearbyHospitals(
            @PathVariable UUID sosReportId) {
        return ResponseEntity.ok(
                ApiResponse.ok("Nearby hospitals fetched.",
                        service.getNearbyEmergencyHospitals(sosReportId)));
    }

    // US-1.5.2 — Send Incoming Rescue Alert //alerting hospital that animal is coming
    @PostMapping("/hospitals/{hospitalId}/alert")
    @PreAuthorize("hasRole('NGO_REP')")
    public ResponseEntity<ApiResponse<Void>> sendAlert(
            @PathVariable UUID sosReportId,
            @PathVariable UUID hospitalId) {
        service.sendIncomingRescueAlert(sosReportId, hospitalId);
        return ResponseEntity.ok(ApiResponse.ok("Incoming rescue alert sent.", null));
    }

    // US-1.5.3 — Book Emergency Slot
    @PostMapping("/booking")
    @PreAuthorize("hasRole('NGO_REP')")
    public ResponseEntity<ApiResponse<EmergencyBookingResponse>> bookSlot(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody EmergencyBookingRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok("Emergency slot booked.",
                        service.bookEmergencySlot(sosReportId, req)));
    }

    // US-1.5.4 — Record Hospital Handover
    @PostMapping("/handover")
    @PreAuthorize("hasRole('HOSPITAL_REP') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<HandoverResponse>> recordHandover(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody HandoverRequest req) {
        return ResponseEntity.ok(
                ApiResponse.ok("Handover recorded. Status: HANDED_OVER.",
                        service.recordHandover(sosReportId, req)));
    }

    // US-1.5.5 — Confirm Release with Photo
    @PostMapping("/release")
    @PreAuthorize("hasRole('NGO_REP')")
    public ResponseEntity<ApiResponse<Void>> confirmRelease(
            @PathVariable UUID sosReportId,
            @Valid @RequestBody ReleaseConfirmationRequest req) {
        service.confirmRelease(sosReportId, req);
        return ResponseEntity.ok(ApiResponse.ok("Release confirmed. Case pending closure.", null));
    }
}

