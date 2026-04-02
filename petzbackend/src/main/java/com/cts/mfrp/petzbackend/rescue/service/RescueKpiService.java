package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.rescue.dto.KpiRequest;
import com.cts.mfrp.petzbackend.rescue.dto.KpiResponse;
import com.cts.mfrp.petzbackend.rescue.repository.NgoAssignmentRepository;
import com.cts.mfrp.petzbackend.sosreport.repository.SosReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * US-1.8.3 – Computes rescue KPIs for the admin dashboard.
 */
@Service
@RequiredArgsConstructor
public class RescueKpiService {

    private final SosReportRepository sosReportRepo;
    private final NgoAssignmentRepository   ngoAssignmentRepo;

    public KpiResponse computeKpis(KpiRequest req) {
        var from = req.getFrom();
        var to   = req.getTo();

        long   total      = sosReportRepo.countAll(from, to);
        long   completed  = sosReportRepo.countCompleted(from, to);
        long   dispatched = ngoAssignmentRepo.countTotalDispatched(from, to);
        long   accepted   = ngoAssignmentRepo.countAccepted(from, to);
        Double avgMins    = sosReportRepo.avgMinutesToAcceptance(from, to);

        double completionRate = total      > 0 ? round((completed * 100.0) / total)      : 0.0;
        double responseRate   = dispatched > 0 ? round((accepted  * 100.0) / dispatched) : 0.0;

        // TODO: replace stub with real hospital_handovers table query
        double handoverRate = completed > 0 ? 85.0 : 0.0;

        return KpiResponse.builder()
                .avgMinutesToAcceptance(avgMins != null ? round(avgMins) : 0.0)
                .completionRatePercent(completionRate)
                .hospitalHandoverRatePercent(handoverRate)
                .volunteerResponseRatePercent(responseRate)
                .totalSos(total)
                .completedSos(completed)
                .totalDispatched(dispatched)
                .acceptedDispatched(accepted)
                .build();
    }

    private double round(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}