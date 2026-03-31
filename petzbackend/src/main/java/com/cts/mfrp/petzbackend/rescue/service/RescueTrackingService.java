package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.rescue.dto.RescueMissionResponse;
import com.cts.mfrp.petzbackend.rescue.dto.RescueStatusUpdateRequest;
import com.cts.mfrp.petzbackend.rescue.model.RescueMission;
import com.cts.mfrp.petzbackend.rescue.repository.RescueMissionRepository;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import com.cts.mfrp.petzbackend.sosreport.repository.SosReportRepository;
import com.cts.mfrp.petzbackend.statuslog.service.StatusLogService;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RescueTrackingService {

    private final RescueMissionRepository rescueMissionRepository;
    private final SosReportRepository sosReportRepository;
    private final UserRepository userRepository;
    private final StatusLogService statusLogService;

    @Transactional
    public RescueMissionResponse createMission(UUID sosReportId) {
        SosReport sosReport = sosReportRepository.findById(sosReportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "SOS Report not found with id: " + sosReportId));

        RescueMission mission = RescueMission.builder()
                .sosReport(sosReport)
                .rescueStatus(ReportStatus.REPORTED)
                .build();

        RescueMission saved = rescueMissionRepository.save(mission);
        statusLogService.logStatusChange(sosReport, ReportStatus.REPORTED.name());

        log.info("Rescue mission created: id={}, sosReportId={}", saved.getId(), sosReportId);
        return mapToResponse(saved);
    }

    @Transactional
    public RescueMissionResponse updateStatus(UUID missionId, RescueStatusUpdateRequest request) {
        RescueMission mission = rescueMissionRepository.findById(missionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rescue mission not found with id: " + missionId));

        validateStatusTransition(mission.getRescueStatus(), request.getNewStatus());

        mission.setRescueStatus(request.getNewStatus());
        mission.setEtaMinutes(request.getEtaMinutes());

        // Assign NGO user if provided during dispatch
        if (request.getAssignedNgoUserId() != null) {
            User ngoUser = userRepository.findById(request.getAssignedNgoUserId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User not found with id: " + request.getAssignedNgoUserId()));
            mission.setAssignedNgoUser(ngoUser);
        }

        // Record timestamps per status
        switch (request.getNewStatus()) {
            case DISPATCHED -> mission.setDispatchedAt(LocalDateTime.now());
            case ON_SITE -> mission.setOnSiteAt(LocalDateTime.now());
            case TRANSPORTING -> mission.setTransportingAt(LocalDateTime.now());
            case COMPLETE -> mission.setCompletedAt(LocalDateTime.now());
            default -> { }
        }

        // Sync status back to SOS report
        mission.getSosReport().setCurrentStatus(request.getNewStatus());

        RescueMission saved = rescueMissionRepository.save(mission);
        statusLogService.logStatusChange(mission.getSosReport(), request.getNewStatus().name());

        log.info("Rescue mission {} status updated to {}", missionId, request.getNewStatus());
        return mapToResponse(saved);
    }

    public RescueMissionResponse getMissionById(UUID missionId) {
        RescueMission mission = rescueMissionRepository.findById(missionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rescue mission not found with id: " + missionId));
        return mapToResponse(mission);
    }

    public RescueMissionResponse getMissionBySosReportId(UUID sosReportId) {
        RescueMission mission = rescueMissionRepository.findBySosReportId(sosReportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rescue mission not found for SOS report: " + sosReportId));
        return mapToResponse(mission);
    }

    public List<RescueMissionResponse> getMissionsByStatus(ReportStatus status) {
        return rescueMissionRepository.findByRescueStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateStatusTransition(ReportStatus current, ReportStatus next) {
        boolean valid = switch (current) {
            case REPORTED -> next == ReportStatus.DISPATCHED;
            case DISPATCHED -> next == ReportStatus.ON_SITE;
            case ON_SITE -> next == ReportStatus.TRANSPORTING;
            case TRANSPORTING -> next == ReportStatus.COMPLETE;
            default -> false;
        };

        if (!valid) {
            throw new IllegalStateException(
                    "Invalid status transition: " + current + " -> " + next +
                            ". Expected flow: REPORTED > DISPATCHED > ON_SITE > TRANSPORTING > COMPLETE");
        }
    }

    private RescueMissionResponse mapToResponse(RescueMission mission) {
        return RescueMissionResponse.builder()
                .id(mission.getId())
                .sosReportId(mission.getSosReport().getId())
                .assignedNgoUserId(mission.getAssignedNgoUser() != null
                        ? mission.getAssignedNgoUser().getId() : null)
                .assignedNgoUserName(mission.getAssignedNgoUser() != null
                        ? mission.getAssignedNgoUser().getFullName() : null)
                .rescueStatus(mission.getRescueStatus())
                .etaMinutes(mission.getEtaMinutes())
                .dispatchedAt(mission.getDispatchedAt())
                .onSiteAt(mission.getOnSiteAt())
                .transportingAt(mission.getTransportingAt())
                .completedAt(mission.getCompletedAt())
                .createdAt(mission.getCreatedAt())
                .updatedAt(mission.getUpdatedAt())
                .build();
    }
}
