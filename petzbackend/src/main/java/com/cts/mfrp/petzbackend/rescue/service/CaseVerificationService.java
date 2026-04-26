package com.cts.mfrp.petzbackend.rescue.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.rescue.dto.CaseVerificationRequest;
import com.cts.mfrp.petzbackend.rescue.dto.CaseVerificationResponse;
import com.cts.mfrp.petzbackend.rescue.model.CaseVerification;
import com.cts.mfrp.petzbackend.rescue.model.RescueMission;
import com.cts.mfrp.petzbackend.rescue.repository.CaseVerificationRepository;
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
public class CaseVerificationService {

    private final RescueMissionRepository rescueMissionRepository;
    private final CaseVerificationRepository caseVerificationRepository;
    private final UserRepository userRepository;
    private final StatusLogService statusLogService;

    @Transactional
    public CaseVerificationResponse verifyAndClose(UUID missionId, CaseVerificationRequest request) {
        RescueMission mission = rescueMissionRepository.findById(missionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Rescue mission not found with id: " + missionId));

        // Only MISSION_COMPLETE cases can be verified
        if (mission.getRescueStatus() != ReportStatus.MISSION_COMPLETE) {
            throw new IllegalStateException(
                    "Mission must be in MISSION_COMPLETE status for verification. Current: "
                            + mission.getRescueStatus());
        }

        // Closed cases are immutable — cannot re-verify
        if (caseVerificationRepository.findByRescueMissionId(missionId).isPresent()) {
            throw new IllegalStateException(
                    "Case already verified/closed. Closed cases are immutable.");
        }

        User admin = userRepository.findById(request.getAdminUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Admin user not found with id: " + request.getAdminUserId()));

        CaseVerification verification = CaseVerification.builder()
                .rescueMission(mission)
                .verifiedBy(admin)
                .flagged(request.isFlagged())
                .flagNotes(request.getFlagNotes())
                .auditNotes(request.getAuditNotes())
                .build();

        CaseVerification saved = caseVerificationRepository.save(verification);

        // Set final status: FLAGGED if discrepancies found, CLOSED otherwise
        ReportStatus finalStatus = request.isFlagged()
                ? ReportStatus.FLAGGED
                : ReportStatus.CLOSED;

        mission.setRescueStatus(finalStatus);
        mission.getSosReport().setCurrentStatus(finalStatus);
        rescueMissionRepository.save(mission);

        statusLogService.logStatusChange(mission.getSosReport(), finalStatus.name());

        log.info("Case {} verified by admin {}. Final status: {}",
                missionId, request.getAdminUserId(), finalStatus);

        return mapToResponse(saved, finalStatus);
    }

    @Transactional(readOnly = true)
    public CaseVerificationResponse getVerificationByMissionId(UUID missionId) {
        CaseVerification verification = caseVerificationRepository.findByRescueMissionId(missionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Case verification not found for mission: " + missionId));

        RescueMission mission = verification.getRescueMission();
        return mapToResponse(verification, mission.getRescueStatus());
    }

    private CaseVerificationResponse mapToResponse(CaseVerification v, ReportStatus finalStatus) {
        return CaseVerificationResponse.builder()
                .id(v.getId())
                .rescueMissionId(v.getRescueMission().getId())
                .finalStatus(finalStatus)
                .verifiedByUserId(v.getVerifiedBy().getId())
                .verifiedByUserName(v.getVerifiedBy().getFullName())
                .flagged(v.isFlagged())
                .flagNotes(v.getFlagNotes())
                .auditNotes(v.getAuditNotes())
                .closedAt(v.getClosedAt())
                .build();
    }
}
