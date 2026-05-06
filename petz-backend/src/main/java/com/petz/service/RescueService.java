package com.petz.service;

import com.petz.dto.request.RescueRequest;
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
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

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
        // Sort NGOs by active rescue count (round-robin fairness)
        List<Ngo> activeNgos = ngoRepo.findByIsActive(true).stream()
                .filter(n -> n.getIsVerified())
                .sorted(Comparator.comparingLong(
                        n -> rescueRepo.countByAssignedNgoAndStatus(n.getId(), RescueStatus.IN_PROGRESS)
                ))
                .limit(5)
                .toList();

        if (activeNgos.isEmpty()) return;

        Ngo chosen = activeNgos.get(0);
        rescue.setAssignedNgo(chosen.getId());
        rescue.setStatus(RescueStatus.ASSIGNED);
        rescueRepo.save(rescue);

        RescueQueue q = new RescueQueue();
        q.setRescueId(rescue.getId());
        q.setNgoId(chosen.getId());
        q.setExpiresAt(LocalDateTime.now().plusMinutes(QUEUE_TIMEOUT_MINUTES));
        queueRepo.save(q);

        notificationService.notifyUser(
                chosen.getOwnerUserId(),
                "New Rescue Assignment",
                "A new rescue has been assigned to your NGO. Please respond within 5 minutes.",
                rescue.getId(), "RESCUE"
        );
    }

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
            notificationService.notifyUser(rescue.getReporterId(),
                    "Rescue Accepted",
                    "An NGO has accepted your rescue report and is on the way.",
                    rescue.getId(), "RESCUE");
        } else {
            q.setResponse(QueueResponse.DECLINED);
            rescue.setStatus(RescueStatus.PENDING);
            rescue.setAssignedNgo(null);
            // Re-assign to next NGO
            assignToNgo(rescue);
        }

        queueRepo.save(q);
        return rescueRepo.save(rescue);
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

    public List<RescueReport> getByReporter(Long reporterId) {
        return rescueRepo.findByReporterId(reporterId);
    }

    public List<RescueReport> getByNgo(Long ngoUserId) {
        Ngo ngo = ngoRepo.findByOwnerUserId(ngoUserId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found."));
        return rescueRepo.findByAssignedNgo(ngo.getId());
    }

    public List<RescueReport> getAll() {
        return rescueRepo.findAll();
    }

    public List<RescueReport> getByStatus(String status) {
        try {
            return rescueRepo.findByStatus(RescueStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
    }

    public RescueReport getById(Long id) {
        return rescueRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rescue not found: " + id));
    }
}
