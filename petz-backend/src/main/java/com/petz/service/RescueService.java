package com.petz.service;

import com.petz.dto.request.RescueRequest;
import com.petz.dto.response.RescueReportResponse;
import com.petz.entity.Ngo;
import com.petz.entity.RescueQueue;
import com.petz.entity.RescueReport;
import com.petz.enums.Criticality;
import com.petz.enums.QueueResponse;
import com.petz.enums.RescueStatus;
import com.petz.exception.BadRequestException;
import com.petz.exception.ResourceNotFoundException;
import com.petz.repository.NgoRepository;
import com.petz.repository.RescueQueueRepository;
import com.petz.repository.RescueReportRepository;
import com.petz.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class RescueService {

    private final RescueReportRepository rescueRepo;
    private final RescueQueueRepository queueRepo;
    private final NgoRepository ngoRepo;
    private final NotificationService notificationService;
    private final FileStorageUtil fileStorage;

    private static final int QUEUE_TIMEOUT_MINUTES = 5;

    public RescueReport submitRescue(Long reporterId, RescueRequest req, MultipartFile photo) throws IOException {
        RescueReport r = new RescueReport();
        r.setReporterId(reporterId);
        r.setReporterPhone(req.getReporterPhone());
        r.setAnimalType(req.getAnimalType());
        r.setDescription(req.getDescription());
        r.setLatitude(req.getLatitude());
        r.setLongitude(req.getLongitude());
        r.setAddress(req.getAddress());
        if (req.getCriticality() != null) {
            try { r.setCriticality(Criticality.valueOf(req.getCriticality().toUpperCase())); }
            catch (IllegalArgumentException ignored) {}
        }
        if (photo != null && !photo.isEmpty()) {
            r.setPhotoUrl(fileStorage.store(photo, "rescue-photos"));
        }
        r = rescueRepo.save(r);
        assignToNgo(r);
        return r;
    }

    public void assignToNgo(RescueReport rescue) {
        // Build the set of NGO IDs that have already declined or timed out for this rescue
        Set<Long> declinedIds = new HashSet<>();
        if (rescue.getDeclinedNgoIds() != null && !rescue.getDeclinedNgoIds().isBlank()) {
            Arrays.stream(rescue.getDeclinedNgoIds().split(","))
                  .map(String::trim)
                  .filter(s -> !s.isEmpty())
                  .map(Long::parseLong)
                  .forEach(declinedIds::add);
        }

        // Sort NGOs by active rescue count (round-robin fairness), exclude already-declined ones
        List<Ngo> activeNgos = ngoRepo.findByIsActive(true).stream()
                .filter(n -> n.getIsVerified())
                .filter(n -> !declinedIds.contains(n.getId()))
                .sorted(Comparator.comparingLong(
                        n -> rescueRepo.countByAssignedNgoAndStatus(n.getId(), RescueStatus.IN_PROGRESS)
                ))
                .limit(5)
                .toList();

        // If every NGO has declined in this cycle, reset and start fresh
        if (activeNgos.isEmpty() && !declinedIds.isEmpty()) {
            log.info("Rescue {}: all {} NGOs declined — resetting decline list and restarting cycle.",
                     rescue.getId(), declinedIds.size());
            rescue.setDeclinedNgoIds(null);
            rescueRepo.save(rescue);
            activeNgos = ngoRepo.findByIsActive(true).stream()
                    .filter(n -> n.getIsVerified())
                    .sorted(Comparator.comparingLong(
                            n -> rescueRepo.countByAssignedNgoAndStatus(n.getId(), RescueStatus.IN_PROGRESS)
                    ))
                    .limit(5)
                    .toList();
        }

        if (activeNgos.isEmpty()) {
            log.warn("Rescue {}: no active verified NGOs available.", rescue.getId());
            return;
        }

        Ngo chosen = activeNgos.get(0);
        rescue.setAssignedNgo(chosen.getId());
        rescue.setStatus(RescueStatus.ASSIGNED);
        rescueRepo.save(rescue);

        // ── Update existing queue entry in-place, or create new one ──────────────
        // Re-using the same row avoids a unique-constraint violation when re-assigning
        // after a decline or timeout (rescue_queue.rescue_id has a UNIQUE constraint).
        RescueQueue q = queueRepo.findByRescueId(rescue.getId())
                .orElse(new RescueQueue());
        q.setRescueId(rescue.getId());
        q.setNgoId(chosen.getId());
        q.setExpiresAt(LocalDateTime.now().plusMinutes(QUEUE_TIMEOUT_MINUTES));
        q.setResponse(QueueResponse.PENDING);
        q.setRespondedAt(null);
        queueRepo.save(q);

        notificationService.notifyUser(
                chosen.getOwnerUserId(),
                "New Rescue Reported",
                "A new animal rescue has been reported near you. Please respond within 5 minutes.",
                rescue.getId(), "RESCUE"
        );
        log.info("Rescue {} assigned to NGO {} ({})", rescue.getId(), chosen.getId(), chosen.getName());
    }

    @Transactional
    public RescueReport respondToQueue(Long rescueId, Long ngoUserId, String response) {
        RescueReport rescue = getById(rescueId);
        Ngo ngo = ngoRepo.findByOwnerUserId(ngoUserId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found."));

        RescueQueue q = queueRepo.findByRescueId(rescueId)
                .orElseThrow(() -> new ResourceNotFoundException("Queue entry not found."));

        if (!q.getNgoId().equals(ngo.getId())) {
            throw new BadRequestException("This rescue is not assigned to your NGO.");
        }

        q.setRespondedAt(LocalDateTime.now());

        if ("ACCEPT".equalsIgnoreCase(response)) {
            q.setResponse(QueueResponse.ACCEPTED);
            rescue.setStatus(RescueStatus.IN_PROGRESS);
            queueRepo.save(q);
            rescueRepo.save(rescue);
            notificationService.notifyUser(rescue.getReporterId(),
                    "Rescue Accepted",
                    "An NGO has accepted your rescue report and is on the way.",
                    rescue.getId(), "RESCUE");
        } else {
            // Track this NGO as declined so it won't be picked again in this rescue cycle
            Long declinedNgoId = ngo.getId();
            String existing = rescue.getDeclinedNgoIds();
            rescue.setDeclinedNgoIds(
                    (existing == null || existing.isBlank()) ? declinedNgoId.toString()
                                                             : existing + "," + declinedNgoId
            );
            rescue.setStatus(RescueStatus.PENDING);
            rescue.setAssignedNgo(null);
            // Save queue response BEFORE calling assignToNgo (which will reuse this queue row)
            q.setResponse(QueueResponse.DECLINED);
            queueRepo.save(q);
            // Re-assign to next eligible NGO
            assignToNgo(rescue);
        }

        return getById(rescueId); // Return fresh state after re-assignment
    }

    public RescueReport complete(Long rescueId, Long ngoUserId, String notes) {
        RescueReport r = getById(rescueId);
        r.setStatus(RescueStatus.COMPLETED);
        r.setResolutionNotes(notes);
        r = rescueRepo.save(r);
        notificationService.notifyUser(r.getReporterId(),
                "Rescue Completed",
                "The rescue has been completed. " + (notes != null ? notes : ""),
                r.getId(), "RESCUE");
        return r;
    }

    public List<RescueReportResponse> getByReporter(Long reporterId) {
        return rescueRepo.findByReporterId(reporterId).stream()
                .map(r -> {
                    Ngo ngo = r.getAssignedNgo() != null
                            ? ngoRepo.findById(r.getAssignedNgo()).orElse(null) : null;
                    return RescueReportResponse.from(r, ngo);
                })
                .toList();
    }

    public List<RescueReport> getByNgo(Long ngoUserId) {
        Ngo ngo = ngoRepo.findByOwnerUserId(ngoUserId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found."));
        return rescueRepo.findByAssignedNgo(ngo.getId());
    }

    public List<RescueReport> getAll() {
        return rescueRepo.findAll();
    }

    public List<RescueReportResponse> getAllEnriched() {
        return rescueRepo.findAll().stream()
                .map(r -> {
                    Ngo ngo = r.getAssignedNgo() != null
                            ? ngoRepo.findById(r.getAssignedNgo()).orElse(null) : null;
                    return RescueReportResponse.from(r, ngo);
                })
                .toList();
    }

    public List<RescueReport> getByStatus(String status) {
        try {
            return rescueRepo.findByStatus(RescueStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
    }

    public List<RescueReportResponse> getByStatusEnriched(String status) {
        try {
            return rescueRepo.findByStatus(RescueStatus.valueOf(status.toUpperCase())).stream()
                    .map(r -> {
                        Ngo ngo = r.getAssignedNgo() != null
                                ? ngoRepo.findById(r.getAssignedNgo()).orElse(null) : null;
                        return RescueReportResponse.from(r, ngo);
                    })
                    .toList();
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
    }

    public RescueReport getById(Long id) {
        return rescueRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue not found: " + id));
    }
}
