package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.hospital.model.Appointment;
import com.cts.mfrp.petzbackend.hospital.model.Appointment.SlotStatus;
import com.cts.mfrp.petzbackend.hospital.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * US-3.4.2 AC#3 — "Expired locks release slot".
 *
 * Runs every 30 seconds, flips any LOCKED slot whose {@code lockedUntil}
 * has elapsed back to AVAILABLE so it can be booked by someone else.
 */
@Component
@RequiredArgsConstructor
public class SlotLockSweeper {

    private static final Logger log = LoggerFactory.getLogger(SlotLockSweeper.class);

    private final AppointmentRepository appointmentRepo;

    @Scheduled(fixedDelayString = "${petz.booking.lock-sweep-ms:30000}")
    @Transactional
    public void releaseExpiredLocks() {
        LocalDateTime now = LocalDateTime.now();
        List<Appointment> expired = appointmentRepo.findExpiredLocks(now);
        if (expired.isEmpty()) return;

        for (Appointment slot : expired) {
            slot.setSlotStatus(SlotStatus.AVAILABLE);
            slot.setLocked(false);
            slot.setLockedUntil(null);
            // Clear the tentative user binding so the slot is truly free.
            slot.setUserId(null);
            slot.setUpdatedAt(now);
        }
        appointmentRepo.saveAll(expired);
        log.info("Released {} expired slot lock(s).", expired.size());
    }
}
