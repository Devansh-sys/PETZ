package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.common.service.NotificationService;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentBookingDtos.AppointmentBookingRequest;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentBookingDtos.AppointmentBookingResponse;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentBookingDtos.AppointmentLockRequest;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentBookingDtos.AppointmentLockResponse;
import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import com.cts.mfrp.petzbackend.hospital.model.Appointment;
import com.cts.mfrp.petzbackend.hospital.model.Appointment.BookingType;
import com.cts.mfrp.petzbackend.hospital.model.Appointment.SlotStatus;
import com.cts.mfrp.petzbackend.hospital.model.Doctor;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.repository.AppointmentRepository;
import com.cts.mfrp.petzbackend.hospital.repository.DoctorRepository;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Epic 3.4 — Appointment Booking.
 *
 * Two-phase booking:
 *   1. {@link #lockSlot(AppointmentLockRequest)}   — transitions the slot from
 *      AVAILABLE → LOCKED for 2 minutes (US-3.4.2). A PESSIMISTIC_WRITE row
 *      lock on SELECT plus the @Version guard on Appointment makes this
 *      atomic under concurrent callers; the second caller sees LOCKED and
 *      gets "Slot Unavailable".
 *   2. {@link #confirmBooking(AppointmentBookingRequest)} — LOCKED → BOOKED,
 *      fills owner/pet/service/type, sets status=CONFIRMED (US-3.4.1) and
 *      fires the confirmation notification (US-3.4.4).
 *
 * Lazy release: {@link #releaseLock} lets the user explicitly abandon a
 * checkout. Expired locks are swept in the background (SlotLockSweeper).
 */
@Service
@RequiredArgsConstructor
public class AppointmentBookingService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentBookingService.class);

    /** US-3.4.2 AC#2 — 2-minute lock window during checkout. */
    public static final int LOCK_TIMEOUT_SECONDS = 120;

    private final AppointmentRepository appointmentRepo;
    private final HospitalRepository    hospitalRepo;
    private final DoctorRepository      doctorRepo;
    private final PetService            petService;
    private final NotificationService   notificationService;

    // ═══════════════════════════════════════════════════════════════════
    //  US-3.4.1 / US-3.4.2  — Lock a slot during checkout
    // ═══════════════════════════════════════════════════════════════════

    @Transactional
    public AppointmentLockResponse lockSlot(AppointmentLockRequest req) {
        Appointment slot = appointmentRepo.findByIdForUpdate(req.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot", req.getSlotId()));

        LocalDateTime now = LocalDateTime.now();

        // If the slot was previously LOCKED but the lock expired, free it
        // immediately so the current caller can grab it.
        if (slot.getSlotStatus() == SlotStatus.LOCKED
                && slot.getLockedUntil() != null
                && slot.getLockedUntil().isBefore(now)) {
            slot.setSlotStatus(SlotStatus.AVAILABLE);
            slot.setLocked(false);
            slot.setLockedUntil(null);
        }

        // Idempotent: same user re-locking their own still-valid lock is OK.
        if (slot.getSlotStatus() == SlotStatus.LOCKED
                && req.getUserId().equals(slot.getUserId())
                && slot.getLockedUntil() != null
                && slot.getLockedUntil().isAfter(now)) {
            return buildLockResponse(slot, "Slot already locked by this user.");
        }

        if (slot.getSlotStatus() != SlotStatus.AVAILABLE) {
            // US-3.4.2 AC#4 — concurrent / unavailable slot.
            throw new IllegalStateException("Slot Unavailable");
        }

        slot.setSlotStatus(SlotStatus.LOCKED);
        slot.setLocked(true);
        slot.setUserId(req.getUserId());
        slot.setLockedUntil(now.plusSeconds(LOCK_TIMEOUT_SECONDS));
        slot.setUpdatedAt(now);
        appointmentRepo.save(slot);

        return buildLockResponse(slot, "Slot locked for " + LOCK_TIMEOUT_SECONDS + "s.");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  US-3.4.1 — Confirm booking (+ US-3.4.3 pet link + US-3.4.5 type)
    // ═══════════════════════════════════════════════════════════════════

    @Transactional
    public AppointmentBookingResponse confirmBooking(AppointmentBookingRequest req) {
        Appointment slot = appointmentRepo.findByIdForUpdate(req.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot", req.getSlotId()));

        LocalDateTime now = LocalDateTime.now();

        // Must be locked by this same user and the lock must still be valid.
        if (slot.getSlotStatus() != SlotStatus.LOCKED
                || !req.getUserId().equals(slot.getUserId())
                || slot.getLockedUntil() == null
                || slot.getLockedUntil().isBefore(now)) {
            throw new IllegalStateException(
                    "Slot lock expired or invalid — please retry booking.");
        }

        // US-3.4.3 — pet must belong to the booking user.
        petService.assertOwnership(req.getPetId(), req.getUserId());

        // US-3.4.5 — if the caller requested an EMERGENCY booking, verify
        // the slot is an emergency-type slot (AC#2 "Emergency uses dedicated slots").
        BookingType requestedType = parseBookingType(req.getBookingType(), slot.getBookingType());
        if (requestedType == BookingType.EMERGENCY && slot.getBookingType() != BookingType.EMERGENCY) {
            throw new IllegalStateException(
                    "Selected slot is not an emergency slot. Pick a dedicated emergency slot.");
        }

        slot.setSlotStatus(SlotStatus.BOOKED);
        slot.setLocked(false);
        slot.setLockedUntil(null);
        slot.setPetId(req.getPetId());
        slot.setServiceType(req.getServiceType());
        slot.setBookingType(requestedType);
        slot.setStatus(AppointmentStatus.CONFIRMED);     // AC#4: status = 'Confirmed'
        slot.setSlotId(slot.getId());                     // self-reference; legacy field
        slot.setUpdatedAt(now);
        Appointment saved = appointmentRepo.save(slot);

        // US-3.4.4 — push + in-app confirmation.
        String details = buildConfirmationMessage(saved);
        notificationService.notifyAppointmentConfirmed(req.getUserId(), saved.getId(), details);

        // US-3.4.5 AC#4 — also alert the hospital for emergency bookings.
        if (saved.getBookingType() == BookingType.EMERGENCY) {
            hospitalRepo.findById(saved.getHospitalId()).ifPresent(h ->
                    notificationService.notifyHospitalEmergencyBooking(
                            h.getOwnerId(), saved.getId(), details));
        }

        log.info("Appointment {} CONFIRMED for user {} pet {} (type {})",
                saved.getId(), req.getUserId(), req.getPetId(), saved.getBookingType());

        return toBookingResponse(saved, "Appointment confirmed.");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Explicit lock release (user cancels checkout)
    // ═══════════════════════════════════════════════════════════════════

    @Transactional
    public void releaseLock(UUID slotId, UUID userId) {
        Appointment slot = appointmentRepo.findByIdForUpdate(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot", slotId));

        if (slot.getSlotStatus() != SlotStatus.LOCKED
                || !userId.equals(slot.getUserId())) {
            // Not this user's lock — nothing to release; stay idempotent.
            return;
        }

        slot.setSlotStatus(SlotStatus.AVAILABLE);
        slot.setLocked(false);
        slot.setLockedUntil(null);
        // Clear the transient user binding so the slot is truly free.
        slot.setUserId(null);
        slot.setUpdatedAt(LocalDateTime.now());
        appointmentRepo.save(slot);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  US-3.4.5 — Emergency booking (entry point used by rescue module)
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Book an emergency slot for a given hospital/time. Used by the rescue
     * flow (via {@code HospitalClient.bookEmergencySlot}) and by any future
     * direct "emergency now" UI. Picks the exact-time emergency slot if it
     * exists, otherwise falls back to the next available emergency slot
     * on that date.
     *
     * Requires a {@code userId} (the reporter/volunteer) and a {@code petId}
     * (may be null if no registered pet yet — caller passes a placeholder).
     */
    @Transactional
    public AppointmentBookingResponse bookEmergencySlot(
            UUID hospitalId, UUID userId, UUID petId,
            LocalDate date, LocalTime time,
            UUID sosReportId, String animalCondition) {

        Appointment slot = appointmentRepo.findEmergencySlot(hospitalId, date, time)
                .or(() -> appointmentRepo.findAvailableEmergencySlots(hospitalId, date)
                        .stream().findFirst())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No available emergency slot at hospital " + hospitalId
                                + " on " + date));

        // Re-fetch with pessimistic lock for the atomic transition.
        Appointment locked = appointmentRepo.findByIdForUpdate(slot.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot", slot.getId()));

        if (locked.getSlotStatus() != SlotStatus.AVAILABLE) {
            throw new IllegalStateException("Slot Unavailable");
        }

        LocalDateTime now = LocalDateTime.now();
        locked.setSlotStatus(SlotStatus.BOOKED);
        locked.setLocked(false);
        locked.setLockedUntil(null);
        locked.setUserId(userId);
        locked.setPetId(petId);
        locked.setBookingType(BookingType.EMERGENCY);
        locked.setStatus(AppointmentStatus.CONFIRMED);
        locked.setServiceType(animalCondition != null ? animalCondition : "EMERGENCY");
        locked.setSosReportId(sosReportId);
        locked.setUpdatedAt(now);
        Appointment saved = appointmentRepo.save(locked);

        String details = buildConfirmationMessage(saved);
        if (userId != null) {
            notificationService.notifyAppointmentConfirmed(userId, saved.getId(), details);
        }
        hospitalRepo.findById(saved.getHospitalId()).ifPresent(h ->
                notificationService.notifyHospitalEmergencyBooking(
                        h.getOwnerId(), saved.getId(), details));

        log.info("Emergency appointment {} booked for SOS {} at hospital {}",
                saved.getId(), sosReportId, hospitalId);
        return toBookingResponse(saved, "Emergency slot booked.");
    }

    // ═══════════════════════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════════════════════

    private BookingType parseBookingType(String raw, BookingType fallback) {
        if (raw == null || raw.isBlank()) return fallback != null ? fallback : BookingType.ROUTINE;
        try {
            return BookingType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Invalid bookingType '" + raw + "'. Allowed: ROUTINE, EMERGENCY.");
        }
    }

    private AppointmentLockResponse buildLockResponse(Appointment slot, String msg) {
        return AppointmentLockResponse.builder()
                .slotId(slot.getId())
                .lockedByUserId(slot.getUserId())
                .lockedUntil(slot.getLockedUntil())
                .lockTimeoutSeconds(LOCK_TIMEOUT_SECONDS)
                .message(msg)
                .build();
    }

    private AppointmentBookingResponse toBookingResponse(Appointment a, String message) {
        return AppointmentBookingResponse.builder()
                .appointmentId(a.getId())
                .slotId(a.getId())
                .userId(a.getUserId())
                .petId(a.getPetId())
                .hospitalId(a.getHospitalId())
                .doctorId(a.getDoctorId())
                .serviceType(a.getServiceType())
                .bookingType(a.getBookingType() != null ? a.getBookingType().name() : null)
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .confirmedAt(a.getUpdatedAt())
                .message(message)
                .build();
    }

    private String buildConfirmationMessage(Appointment a) {
        String hospitalName = hospitalRepo.findById(a.getHospitalId())
                .map(Hospital::getName).orElse("hospital");
        String doctorName = a.getDoctorId() == null ? "any available doctor"
                : doctorRepo.findById(a.getDoctorId()).map(Doctor::getName).orElse("doctor");
        return String.format(
                "Appointment confirmed at %s with Dr. %s for %s on %s at %s (type: %s, pet: %s).",
                hospitalName, doctorName,
                a.getServiceType() != null ? a.getServiceType() : "consultation",
                a.getAppointmentDate(), a.getAppointmentTime(),
                a.getBookingType(), a.getPetId());
    }
}
