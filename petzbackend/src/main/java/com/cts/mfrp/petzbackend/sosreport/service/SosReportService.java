package com.cts.mfrp.petzbackend.sosreport.service;

import com.cts.mfrp.petzbackend.common.exception.FileValidationException;
import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.enums.ReportStatus;
import com.cts.mfrp.petzbackend.enums.SosMediaType;
import com.cts.mfrp.petzbackend.rescue.model.RescueMission;
import com.cts.mfrp.petzbackend.rescue.repository.RescueMissionRepository;
import com.cts.mfrp.petzbackend.sosmedia.dto.SosMediaResponse;
import com.cts.mfrp.petzbackend.sosmedia.model.SosMedia;
import com.cts.mfrp.petzbackend.sosmedia.repository.SosMediaRepository;
import com.cts.mfrp.petzbackend.sosmedia.service.FileStorageService;
import com.cts.mfrp.petzbackend.sosreport.dto.SosReportCreateRequest;
import com.cts.mfrp.petzbackend.sosreport.dto.SosReportResponse;
import com.cts.mfrp.petzbackend.sosreport.model.SosReport;
import com.cts.mfrp.petzbackend.sosreport.repository.SosReportRepository;
import com.cts.mfrp.petzbackend.statuslog.service.StatusLogService;
import com.cts.mfrp.petzbackend.user.model.User;
import com.cts.mfrp.petzbackend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SosReportService {

    private final SosReportRepository sosReportRepository;
    private final SosMediaRepository sosMediaRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final StatusLogService statusLogService;
    private final RescueMissionRepository rescueMissionRepository;

    @Transactional
    public SosReportResponse createReport(SosReportCreateRequest request) {

        // 1. Validate reporter exists
        User reporter = userRepository.findById(request.getReporterId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + request.getReporterId()));

        // 2. Build entity
        SosReport report = SosReport.builder()
                .reporter(reporter)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .urgencyLevel(request.getUrgencyLevel())       // mandatory
                .currentStatus(ReportStatus.REPORTED)
                .description(request.getDescription())          // optional
                .build();

        SosReport saved = sosReportRepository.save(report);

        // 3. Auto-create a rescue mission so the status page can track it immediately
        RescueMission mission = RescueMission.builder()
                .sosReport(saved)
                .rescueStatus(ReportStatus.REPORTED)
                .sosLat(request.getLatitude() != null ? request.getLatitude().doubleValue() : null)
                .sosLon(request.getLongitude() != null ? request.getLongitude().doubleValue() : null)
                .build();
        rescueMissionRepository.save(mission);

        // 4. Audit trail
        statusLogService.logStatusChange(saved, ReportStatus.REPORTED.name());

        log.info("SOS Report created: id={}, urgency={}", saved.getId(), saved.getUrgencyLevel());

        return mapToResponse(saved);
    }

    @Transactional
    public SosReportResponse uploadMedia(UUID reportId, List<MultipartFile> files) {

        SosReport report = sosReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "SOS Report not found with id: " + reportId));

        long existingCount = sosMediaRepository.countBySosReportId(reportId);

        boolean hasPhotos = files.stream().anyMatch(fileStorageService::isImage);
        boolean hasVideos = files.stream().anyMatch(fileStorageService::isVideo);

        // Rule: cannot mix photos and video
        if (hasPhotos && hasVideos) {
            throw new FileValidationException(
                    "Cannot upload both photos and video. " +
                            "Choose up to 3 photos OR one 10-second video.");
        }

        // Rule: max 1 video, and only if no existing media
        if (hasVideos) {
            if (files.size() > 1) {
                throw new FileValidationException(
                        "Only one video is allowed per report.");
            }
            if (existingCount > 0) {
                throw new FileValidationException(
                        "Report already has media. Cannot add video.");
            }
        }

        // Rule: max 3 photos total
        if (hasPhotos) {
            long totalAfterUpload = existingCount + files.size();
            if (totalAfterUpload > 3) {
                throw new FileValidationException(
                        "Maximum 3 photos allowed. Currently " + existingCount +
                                " uploaded, trying to add " + files.size() + ".");
            }
        }

        // Store each file
        for (MultipartFile file : files) {
            String storedUrl = fileStorageService.storeFile(file);

            SosMediaType type = fileStorageService.isVideo(file)
                    ? SosMediaType.VIDEO
                    : SosMediaType.PHOTO;

            SosMedia media = SosMedia.builder()
                    .sosReport(report)
                    .fileUrl(storedUrl)
                    .mediaType(type)
                    .build();

            sosMediaRepository.save(media);
            report.addMedia(media);
        }

        log.info("Media uploaded to report {}: {} file(s)",
                reportId, files.size());

        return mapToResponse(report);
    }
    @Transactional(readOnly = true)
    public SosReportResponse getReportById(UUID reportId) {
        SosReport report = sosReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "SOS Report not found with id: " + reportId));
        return mapToResponse(report);
    }
    @Transactional(readOnly = true)
    public List<SosReportResponse> getAllReports() {
        return sosReportRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    private SosReportResponse mapToResponse(SosReport report) {

        List<SosMediaResponse> mediaResponses = report.getMediaFiles().stream()
                .map(m -> SosMediaResponse.builder()
                        .id(m.getId())
                        .fileUrl(m.getFileUrl())
                        .mediaType(m.getMediaType())
                        .build())
                .collect(Collectors.toList());

        return SosReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporter().getId())
                .reporterName(report.getReporter().getFullName()) // ← adjust getter
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .urgencyLevel(report.getUrgencyLevel())
                .currentStatus(report.getCurrentStatus())
                .description(report.getDescription())
                .reportedAt(report.getReportedAt())
                .media(mediaResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SosReportResponse> getReportsByReporter(UUID reporterId) {
        return sosReportRepository.findByReporter_IdOrderByReportedAtDesc(reporterId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SosReportResponse updateStatus(UUID reportId, ReportStatus newStatus) {
        SosReport report = sosReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "SOS Report not found with id: " + reportId));

        report.setCurrentStatus(newStatus);
        SosReport updated = sosReportRepository.save(report);

        rescueMissionRepository.findBySosReportId(reportId).ifPresent(mission -> {
            mission.setRescueStatus(newStatus);
            rescueMissionRepository.save(mission);
        });

        statusLogService.logStatusChange(updated, newStatus.name());
        log.info("SOS Report {} status updated to {}", reportId, newStatus);
        return mapToResponse(updated);
    }
}