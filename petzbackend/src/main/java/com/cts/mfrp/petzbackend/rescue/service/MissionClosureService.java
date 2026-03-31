package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.rescue.dto.MissionSummaryRequest;
import com.cts.mfrp.petzbackend.rescue.dto.MissionSummaryResponse;
import com.cts.mfrp.petzbackend.rescue.model.MissionSummary;
import com.cts.mfrp.petzbackend.rescue.model.RescueMission;
import com.cts.mfrp.petzbackend.rescue.repository.MissionSummaryRepository;
import com.cts.mfrp.petzbackend.rescue.repository.RescueMissionRepository;
import com.cts.mfrp.petzbackend.statuslog.service.StatusLogService;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MissionClosureService {

    private final RescueMissionRepository rescueMissionRepository;
    private final MissionSummaryRepository missionSummaryRepository;
    private final UserRepository userRepository;
    private final StatusLogService statusLogService;

    @Transactional
    public MissionSummaryResponse submitSummary(UUID missionId, MissionSummaryRequest request) {
        RescueMission mission = rescueMissionRepository.findById(missionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rescue mission not found with id: " + missionId));

        // Only completed missions can have summaries submitted
        if (mission.getRescueStatus() != ReportStatus.COMPLETE) {
            throw new IllegalStateException(
                    "Mission must be in COMPLETE status before submitting summary. Current: "
                            + mission.getRescueStatus());
        }

        // Check if summary already exists (immutable record)
        if (missionSummaryRepository.findByRescueMissionId(missionId).isPresent()) {
            throw new IllegalStateException(
                    "Mission summary already submitted. Summary records are immutable.");
        }

        User submitter = userRepository.findById(request.getSubmittedByUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + request.getSubmittedByUserId()));

        MissionSummary summary = MissionSummary.builder()
                .rescueMission(mission)
                .outcome(request.getOutcome())
                .timeline(request.getTimeline())
                .notes(request.getNotes())
                .submittedBy(submitter)
                .build();

        MissionSummary saved = missionSummaryRepository.save(summary);

        // Update status to MISSION_COMPLETE
        mission.setRescueStatus(ReportStatus.MISSION_COMPLETE);
        mission.getSosReport().setCurrentStatus(ReportStatus.MISSION_COMPLETE);
        rescueMissionRepository.save(mission);

        statusLogService.logStatusChange(mission.getSosReport(), ReportStatus.MISSION_COMPLETE.name());

        log.info("Mission summary submitted for mission {}, status set to MISSION_COMPLETE", missionId);
        return mapToResponse(saved);
    }

    public MissionSummaryResponse getSummaryByMissionId(UUID missionId) {
        MissionSummary summary = missionSummaryRepository.findByRescueMissionId(missionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Mission summary not found for mission: " + missionId));
        return mapToResponse(summary);
    }

    private MissionSummaryResponse mapToResponse(MissionSummary summary) {
        return MissionSummaryResponse.builder()
                .id(summary.getId())
                .rescueMissionId(summary.getRescueMission().getId())
                .outcome(summary.getOutcome())
                .timeline(summary.getTimeline())
                .notes(summary.getNotes())
                .submittedByUserId(summary.getSubmittedBy().getId())
                .submittedByUserName(summary.getSubmittedBy().getFullName())
                .submittedAt(summary.getSubmittedAt())
                .build();
    }
}
