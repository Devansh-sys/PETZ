//FILE: rescue/service/RescueHistoryService.java
        package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.rescue.dto.RescueHistoryResponse;
import com.cts.mfrp.petzbackend.sosreport.repository.SosReportRepository;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * US-1.7.2 – Returns a registered user's full rescue history, newest first.
 */
@Service
@RequiredArgsConstructor
public class RescueHistoryService {

    private final SosReportRepository sosReportRepo;

    @Transactional(readOnly = true)
    public List<RescueHistoryResponse> getHistoryForUser(UUID userId) {
        List<SosReport> reports =
                sosReportRepo.findByReporter_IdOrderByReportedAtDesc(userId);

        return reports.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private RescueHistoryResponse toResponse(SosReport r) {
        String outcome = r.getCurrentStatus() == ReportStatus.COMPLETE
                ? "Rescue completed" : null;

        return RescueHistoryResponse.builder()
                .sosId(r.getId())
                .reportedAt(r.getReportedAt())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .urgencyLevel(r.getUrgencyLevel())
                .status(r.getCurrentStatus())
                .description(r.getDescription())
                .outcome(outcome)
                .build();
    }
}