package com.cts.mfrp.petzbackend.adoption.service;

import com.cts.mfrp.petzbackend.adoption.enums.FollowUpStatus;
import com.cts.mfrp.petzbackend.adoption.model.Adoption;
import com.cts.mfrp.petzbackend.adoption.model.AdoptionFollowUp;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionFollowUpRepository;
import com.cts.mfrp.petzbackend.adoption.repository.AdoptionRepository;
import com.cts.mfrp.petzbackend.common.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * US-2.5.3 AC#2 — daily reminder for due / overdue follow-ups.
 *
 * Runs at 9 AM server-local time (cron configurable via
 * {@code petz.adoption.followup-reminder-cron}). For each
 * SCHEDULED follow-up whose {@code dueDate <= today} and whose
 * {@code reminderSentAt} is null or from a previous day, we fire
 * notifications to both the adopter and the owning NGO.
 *
 * Idempotency: {@code reminderSentAt} is stamped after notifying, so
 * rerunning the job the same day is a no-op.
 */
@Component
@RequiredArgsConstructor
public class AdoptionFollowUpReminderJob {

    private static final Logger log = LoggerFactory.getLogger(AdoptionFollowUpReminderJob.class);

    private final AdoptionFollowUpRepository followUpRepo;
    private final AdoptionRepository         adoptionRepo;
    private final NotificationService        notifications;

    @Scheduled(cron = "${petz.adoption.followup-reminder-cron:0 0 9 * * *}")
    @Transactional
    public void sendDailyReminders() {
        LocalDate today = LocalDate.now();
        List<AdoptionFollowUp> due = followUpRepo
                .findByStatusAndDueDateLessThanEqual(FollowUpStatus.SCHEDULED, today);
        if (due.isEmpty()) return;

        int sent = 0;
        for (AdoptionFollowUp row : due) {
            // Skip if we already nudged today.
            if (row.getReminderSentAt() != null
                    && row.getReminderSentAt().toLocalDate().equals(today)) {
                continue;
            }
            Adoption adoption = adoptionRepo.findById(row.getAdoptionId()).orElse(null);
            if (adoption == null) continue;

            String details = row.getFollowUpType() + " follow-up due " + row.getDueDate();
            notifications.notifyAdopterFollowUpDue(
                    adoption.getAdopterId(), row.getId(), details);
            notifications.notifyNgoFollowUpDue(
                    adoption.getNgoId(), row.getId(), details);
            row.setReminderSentAt(LocalDateTime.now());
            followUpRepo.save(row);
            sent++;
        }
        log.info("Adoption follow-up reminders dispatched: {}/{} rows", sent, due.size());
    }
}
