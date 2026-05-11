package com.petz.scheduler;

import com.petz.entity.RescueQueue;
import com.petz.entity.RescueReport;
import com.petz.enums.QueueResponse;
import com.petz.enums.RescueStatus;
import com.petz.repository.RescueQueueRepository;
import com.petz.repository.RescueReportRepository;
import com.petz.service.RescueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Runs every 60 seconds.
 * Finds queue entries that have PENDING response and have passed expiry.
 * Marks them TIMED_OUT and re-assigns the rescue to the next eligible NGO.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RescueQueueScheduler {

    private final RescueQueueRepository queueRepo;
    private final RescueReportRepository rescueRepo;
    private final RescueService rescueService;

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void processExpiredQueue() {
        List<RescueQueue> expired = queueRepo.findByResponseAndExpiresAtBefore(
                QueueResponse.PENDING, LocalDateTime.now());

        for (RescueQueue q : expired) {
            // Mark the queue entry timed-out BEFORE calling assignToNgo,
            // so assignToNgo can safely reuse the same row (UPSERT logic).
            q.setResponse(QueueResponse.TIMED_OUT);
            queueRepo.save(q);

            rescueRepo.findById(q.getRescueId()).ifPresent(rescue -> {
                if (rescue.getStatus() == RescueStatus.ASSIGNED) {
                    // Track the NGO that timed out — exclude it from the next assignment attempt
                    Long timedOutNgoId = q.getNgoId();
                    String existing = rescue.getDeclinedNgoIds();
                    rescue.setDeclinedNgoIds(
                            (existing == null || existing.isBlank()) ? timedOutNgoId.toString()
                                                                     : existing + "," + timedOutNgoId
                    );
                    rescue.setStatus(RescueStatus.PENDING);
                    rescue.setAssignedNgo(null);
                    RescueReport saved = rescueRepo.save(rescue);
                    log.info("Rescue {} timed out for NGO {}, re-assigning.", saved.getId(), timedOutNgoId);
                    rescueService.assignToNgo(saved);
                }
            });
        }
    }
}
