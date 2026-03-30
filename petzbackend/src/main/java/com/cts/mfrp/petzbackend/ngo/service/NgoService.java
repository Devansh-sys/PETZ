package com.cts.mfrp.petzbackend.ngo.service;

import com.cts.mfrp.petzbackend.ngo.dto.NavigationDTO;
import com.cts.mfrp.petzbackend.ngo.dto.NgoResponseDTO;
import com.cts.mfrp.petzbackend.ngo.model.Mission;
import com.cts.mfrp.petzbackend.ngo.model.Ngo;
import com.cts.mfrp.petzbackend.ngo.model.StatusLog;
import com.cts.mfrp.petzbackend.ngo.repository.MissionRepository;
import com.cts.mfrp.petzbackend.ngo.repository.NgoRepository;
import com.cts.mfrp.petzbackend.ngo.repository.StatusLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NgoService {

    @Autowired
    private NgoRepository ngoRepository;
    @Autowired
    private MissionRepository missionRepository;
    @Autowired
    private StatusLogRepository statusLogRepository;
    @Autowired
    private NotificationService notificationService;

    // US-1.3.1 Automatic NGO Assignment
    public List<NgoResponseDTO> assignNearestNgo(double sosLat, double sosLon, int severityLevel) {
        int radius = switch (severityLevel) {
            case 1 -> 10;
            case 2 -> 7;
            default -> 5;
        };

        List<Ngo> nearest = ngoRepository.findActiveNgos(); // TODO: filter by distance
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
    public void acceptMission(Long missionId, Long ngoId) {
        Mission mission = missionRepository.findById(missionId).orElseThrow();
        if ("ASSIGNED".equals(mission.getStatus())) throw new IllegalStateException("Already claimed");

        mission.setStatus("ASSIGNED");
        mission.setAssignedNgoId(ngoId);
        mission.setAcceptedAt(LocalDateTime.now());
        missionRepository.save(mission);

        notificationService.notifyOthersMissionClaimed(missionId, ngoId);
        logStatus(missionId, "ACCEPTED");
    }

    // US-1.3.3 Decline Rescue Mission
    public void declineMission(Long missionId, Long ngoId) {
        Mission mission = missionRepository.findById(missionId).orElseThrow();
        mission.getDeclinedNgoIds().add(ngoId);
        missionRepository.save(mission);

        logStatus(missionId, "DECLINED");

        if (mission.getDeclinedNgoIds().size() >= 5) {
            reDispatch(mission);
        }
    }

    // US-1.3.4 GPS Navigation
    public NavigationDTO getNavigationDetails(Long missionId) {
        Mission mission = missionRepository.findById(missionId).orElseThrow();
        return new NavigationDTO(mission.getSosLat(), mission.getSosLon(), "ETA: 10 mins");
    }

    // US-1.3.5 Auto-Reassign on Timeout
    @Scheduled(fixedRate = 60000)
    public void checkTimeouts() {
        List<Mission> pending = missionRepository.findByStatus("PENDING");
        for (Mission mission : pending) {
            if (mission.getCreatedAt().isBefore(LocalDateTime.now()
                    .minusMinutes(timeoutForSeverity(mission.getSeverityLevel())))) {
                mission.setStatus("REDISPATCH");
                missionRepository.save(mission);
                reDispatch(mission);
                logStatus(mission.getId(), "REDISPATCH");
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
    public void logStatus(Long missionId, String status) {
        StatusLog log = new StatusLog();
        log.setMissionId(missionId);
        log.setStatus(status);
        log.setUpdatedAt(LocalDateTime.now());
        statusLogRepository.save(log);
    }

    private void reDispatch(Mission mission) {
        assignNearestNgo(mission.getSosLat(), mission.getSosLon(), mission.getSeverityLevel());
    }
}
