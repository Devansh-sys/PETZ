package com.cts.mfrp.petzbackend.ngo.service;

import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.ngo.dto.AssignResponseDTO;
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
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
    private NotificationService notificationService;

    // US-1.3.1 Automatic NGO Assignment
    public AssignResponseDTO assignNearestNgo(UUID sosReportId, double sosLat, double sosLon, int severityLevel) {
        List<NgoResponseDTO> ngoList = findNearestNgos(sosLat, sosLon, severityLevel);

        // Check if a rescue mission already exists for this SOS report
        var existing = rescueMissionRepository.findBySosReportId(sosReportId);
        RescueMission mission;

        if (existing.isPresent()) {
            // Reuse existing mission — just update NGO fields
            mission = existing.get();
            mission.setSosLat(sosLat);
            mission.setSosLon(sosLon);
            mission.setSeverityLevel(severityLevel);
            mission.setNgoStatus("PENDING");
            mission = rescueMissionRepository.save(mission);
        } else {
            // Create new mission only if none exists
            SosReport sosReport = sosReportRepository.findById(sosReportId)
                    .orElseThrow(() -> new RuntimeException("SOS Report not found: " + sosReportId));

            mission = RescueMission.builder()
                    .sosReport(sosReport)
                    .rescueStatus(ReportStatus.REPORTED)
                    .sosLat(sosLat)
                    .sosLon(sosLon)
                    .severityLevel(severityLevel)
                    .ngoStatus("PENDING")
                    .build();
            mission = rescueMissionRepository.save(mission);
        }

        logStatus(sosReportId, "PENDING");

        return new AssignResponseDTO(mission.getId(), mission.getNgoStatus(), ngoList);
    }

    private List<NgoResponseDTO> findNearestNgos(double sosLat, double sosLon, int severityLevel) {
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
    public void acceptMission(UUID missionId, UUID ngoId) {
        RescueMission mission = rescueMissionRepository.findById(missionId).orElseThrow();
        if ("ASSIGNED".equals(mission.getNgoStatus())) throw new IllegalStateException("Already claimed");

        mission.setNgoStatus("ASSIGNED");
        mission.setAssignedNgoId(ngoId);
        mission.setAcceptedAt(LocalDateTime.now());
        rescueMissionRepository.save(mission);

        notificationService.notifyOthersMissionClaimed(missionId, ngoId);
        logStatus(mission.getSosReport().getId(), "ACCEPTED");
    }

    // US-1.3.3 Decline Rescue Mission
    public void declineMission(UUID missionId, UUID ngoId) {
        RescueMission mission = rescueMissionRepository.findById(missionId).orElseThrow();
        mission.getDeclinedNgoIds().add(ngoId);
        rescueMissionRepository.save(mission);

        logStatus(mission.getSosReport().getId(), "DECLINED");

        if (mission.getDeclinedNgoIds().size() >= 5) {
            reDispatch(mission);
        }
    }

    // US-1.3.4 GPS Navigation
    public NavigationDTO getNavigationDetails(UUID missionId) {
        RescueMission mission = rescueMissionRepository.findById(missionId).orElseThrow();
        return new NavigationDTO(mission.getSosLat(), mission.getSosLon(), "ETA: 10 mins");
    }

    // US-1.3.5 Auto-Reassign on Timeout
    @Scheduled(fixedRate = 60000)
    public void checkTimeouts() {
        List<RescueMission> pending = rescueMissionRepository.findByNgoStatus("PENDING");
        for (RescueMission mission : pending) {
            if (mission.getCreatedAt().isBefore(LocalDateTime.now()
                    .minusMinutes(timeoutForSeverity(mission.getSeverityLevel())))) {
                mission.setNgoStatus("REDISPATCH");
                rescueMissionRepository.save(mission);
                reDispatch(mission);
                logStatus(mission.getSosReport().getId(), "REDISPATCH");
            }
        }
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

    private void reDispatch(RescueMission mission) {
        mission.setNgoStatus("PENDING");
        mission.setAssignedNgoId(null);
        mission.setCreatedAt(LocalDateTime.now());
        mission.getDeclinedNgoIds().clear();
        rescueMissionRepository.save(mission);
    }
}
