package com.cts.mfrp.petzbackend.rescue.controller;

import com.cts.mfrp.petzbackend.rescue.dto.KpiRequest;
import com.cts.mfrp.petzbackend.rescue.dto.KpiResponse;
import com.cts.mfrp.petzbackend.rescue.service.RescueKpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * GET /admin/kpis
 *
 * Returns rescue performance KPIs for the admin dashboard.
 *
 * Query params (all optional):
 *   from   – ISO-8601 datetime  e.g. 2025-01-01T00:00:00
 *   to     – ISO-8601 datetime
 *   ngoId  – UUID string
 *   city   – string (reserved for future DB-level filter)
 *
 * Response: KpiResponse
 *   - avgMinutesToAcceptance, completionRatePercent,
 *     hospitalHandoverRatePercent, volunteerResponseRatePercent,
 *     totalSos, completedSos, totalDispatched, acceptedDispatched
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class RescueKpiController {

    private final RescueKpiService kpiService;

    @GetMapping("/kpis")
    public ResponseEntity<KpiResponse> getKpis(@ModelAttribute KpiRequest req) {
        return ResponseEntity.ok(kpiService.computeKpis(req));
    }
}