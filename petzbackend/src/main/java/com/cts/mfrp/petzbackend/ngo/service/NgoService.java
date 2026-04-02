package com.cts.mfrp.petzbackend.ngo.service;

import com.cts.mfrp.petzbackend.common.service.NotificationService;
import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.ngo.dto.NavigationDTO;
import com.cts.mfrp.petzbackend.ngo.dto.NgoResponseDTO;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import com.cts.mfrp.petzbackend.rescue.model.RescueMission;
import com.cts.mfrp.petzbackend.rescue.repository.RescueMissionRepository;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import com.cts.mfrp.petzbackend.sosreport.repository.SosReportRepository;
import com.cts.mfrp.petzbackend.statuslog.model.StatusLog;
import com.cts.mfrp.petzbackend.statuslog.repository.StatusLogRepository;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class NgoService {

    @Autowired
    private NgoRepository ngoRepository;
    @Autowired
    private RescueMissionRepository rescueMissionRepository;
    @Autowired
    private StatusLogRepository statusLogRepository;
    @Autowired
    private SosReportRepository sosReportRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private NotificationService notificationService;

    // US-1.3.1 Automatic NGO Assignment
    public List<NgoResponseDTO> assignNearestNgo(double sosLat, double sosLon, int severityLevel) {
        List<Ngo> nearest = ngoRepository.findActiveNgos();
        return nearest.stream()
                .limit(5)
                .map(ngo -> new NgoResponseDTO(
                        ngo.getId(),
                        ngo.getName(),
                        calculateDistance(ngo.getLatitude(), ngo.getLongitude(), sosLat, sosLon),
                        "NOTIFIED"))
                .toList();
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
    }

    // US-1.3.2 Accept Rescue Mission
    @Transactional
    public void acceptMission(UUID missionId, UUID ngoUserId) {
        RescueMission mission = rescueMissionRepository.findById(missionId)
                .orElseThrow(() -> new NoSuchElementException("Mission not found: " + missionId));

        if (mission.getRescueStatus() == ReportStatus.DISPATCHED) {
            throw new IllegalStateException("Mission already assigned");
        }

        User ngoUser = userRepository.findById(ngoUserId)
                .orElseThrow(() -> new NoSuchElementException("NGO user not found: " + ngoUserId));

        mission.setRescueStatus(ReportStatus.DISPATCHED);
        mission.setAssignedNgoUser(ngoUser);
        mission.setDispatchedAt(LocalDateTime.now());
        rescueMissionRepository.save(mission);

        // Sync status to SOS report
        mission.getSosReport().setCurrentStatus(ReportStatus.DISPATCHED);
        sosReportRepository.save(mission.getSosReport());

        notificationService.notifyOthersMissionClaimed(0L, 0L);
        logStatus(mission.getSosReport().getId(), "ACCEPTED");
    }

    // US-1.3.3 Decline Rescue Mission
    @Transactional
    public void declineMission(UUID missionId, UUID ngoUserId) {
        RescueMission mission = rescueMissionRepository.findById(missionId)
                .orElseThrow(() -> new NoSuchElementException("Mission not found: " + missionId));

        logStatus(mission.getSosReport().getId(), "DECLINED");
    }

    // US-1.3.4 GPS Navigation
    public NavigationDTO getNavigationDetails(UUID missionId) {
        RescueMission mission = rescueMissionRepository.findById(missionId)
                .orElseThrow(() -> new NoSuchElementException("Mission not found: " + missionId));

        SosReport report = mission.getSosReport();
        return new NavigationDTO(
                report.getLatitude().doubleValue(),
                report.getLongitude().doubleValue(),
                mission.getEtaMinutes() != null
                        ? "ETA: " + mission.getEtaMinutes() + " mins"
                        : "ETA: calculating...");
    }

    // US-1.3.5 Auto-Reassign on Timeout
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void checkTimeouts() {
        List<RescueMission> pending = rescueMissionRepository.findByRescueStatus(ReportStatus.REPORTED);
        for (RescueMission mission : pending) {
            SosReport report = mission.getSosReport();
            int severity = urgencyToSeverity(report.getUrgencyLevel());
            if (mission.getCreatedAt().isBefore(LocalDateTime.now()
                    .minusMinutes(timeoutForSeverity(severity)))) {
                logStatus(report.getId(), "REDISPATCH");
                reDispatch(report);
            }
        }
    }

    private int urgencyToSeverity(com.cts.mfrp.petzbackend.enums.UrgencyLevel level) {
        return switch (level) {
            case CRITICAL -> 1;
            case MODERATE -> 2;
            case LOW -> 3;
        };
    }

    private int timeoutForSeverity(int severity) {
        return switch (severity) {
            case 1 -> 3;
            case 2 -> 5;
            default -> 10;
        };
    }

    // US-1.3.6 Status Log Audit Trail
    public void logStatus(UUID sosReportId, String status) {
        SosReport sosReport = sosReportRepository.findById(sosReportId)
                .orElseThrow(() -> new RuntimeException("SOS Report not found: " + sosReportId));

        StatusLog log = StatusLog.builder()
                .sosReport(sosReport)
                .status(status)
                .build();
        statusLogRepository.save(log);
    }

    private void reDispatch(SosReport report) {
        assignNearestNgo(
                report.getLatitude().doubleValue(),
                report.getLongitude().doubleValue(),
                urgencyToSeverity(report.getUrgencyLevel()));
    }
}
