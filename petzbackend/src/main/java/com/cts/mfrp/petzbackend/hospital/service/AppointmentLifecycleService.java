package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.hospital.dto.CancelAppointmentRequest;
import com.cts.mfrp.petzbackend.hospital.dto.CompleteAppointmentRequest;
import com.cts.mfrp.petzbackend.hospital.dto.RescheduleAppointmentRequest;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentLifecycleResponse;
import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import com.cts.mfrp.petzbackend.hospital.model.Appointment;
import com.cts.mfrp.petzbackend.hospital.repository.AppointmentRepository;
import com.cts.mfrp.petzbackend.common.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentLifecycleService {

    private final AppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    // ── US-3.5.1: Cancel Appointment ─────────────────────────────────────
    @Transactional
    public AppointmentLifecycleResponse cancelAppointment(UUID appointmentId,
                                                          CancelAppointmentRequest req) {
        Appointment appointment = fetchAppointment(appointmentId);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Only CONFIRMED appointments can be cancelled. Current status: "
                            + appointment.getStatus());
        }

        validateCancellationWindow(appointment);

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(req.getReason());
        appointment.setCancelledAt(LocalDateTime.now());
        appointmentRepository.save(appointment);

        // Notify both pet owner and hospital
        notificationService.notifyReporter(appointment.getUserId(),
                "Your appointment has been cancelled. Reason: " + req.getReason());
        notificationService.notifyVolunteer(appointment.getDoctorId(),
                "Appointment " + appointmentId + " has been cancelled by the pet owner.");

        return buildResponse(appointment, "Appointment cancelled successfully.");
    }

    // ── US-3.5.2: Reschedule Appointment ──────────────────────────────────
    @Transactional
    public AppointmentLifecycleResponse rescheduleAppointment(UUID appointmentId,
                                                              RescheduleAppointmentRequest req) {
        Appointment appointment = fetchAppointment(appointmentId);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Only CONFIRMED appointments can be rescheduled. Current status: "
                            + appointment.getStatus());
        }

        validateCancellationWindow(appointment);

        // Ensure new slot is not already taken
        boolean slotTaken = appointmentRepository.existsBySlotIdAndStatusNot(
                req.getNewSlotId(), AppointmentStatus.CANCELLED);
        if (slotTaken) {
            throw new IllegalStateException("Selected slot is already booked.");
        }

        // Release old slot by updating to new slot (old slot freed implicitly)
        appointment.setSlotId(req.getNewSlotId());
        appointment.setStatus(AppointmentStatus.CONFIRMED);   // stays CONFIRMED on new slot
        appointment.setRescheduledAt(LocalDateTime.now());
        appointmentRepository.save(appointment);

        // Notify both parties
        notificationService.notifyReporter(appointment.getUserId(),
                "Your appointment has been rescheduled. New slot ID: " + req.getNewSlotId());
        notificationService.notifyVolunteer(appointment.getDoctorId(),
                "Appointment " + appointmentId + " has been rescheduled to slot: " + req.getNewSlotId());

        return buildResponse(appointment, "Appointment rescheduled successfully.");
    }

    // ── US-3.5.3: Mark Appointment as Attended ────────────────────────────
    @Transactional
    public AppointmentLifecycleResponse markAttended(UUID appointmentId) {
        Appointment appointment = fetchAppointment(appointmentId);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Only CONFIRMED appointments can be marked as attended. Current status: "
                            + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.ATTENDED);
        appointment.setAttendedAt(LocalDateTime.now());
        appointmentRepository.save(appointment);

        return buildResponse(appointment, "Appointment marked as attended.");
    }

    // ── US-3.5.4: Complete Appointment with Notes ─────────────────────────
    @Transactional
    public AppointmentLifecycleResponse completeAppointment(UUID appointmentId,
                                                            CompleteAppointmentRequest req) {
        Appointment appointment = fetchAppointment(appointmentId);

        if (appointment.getStatus() != AppointmentStatus.ATTENDED) {
            throw new IllegalStateException(
                    "Only ATTENDED appointments can be completed. Current status: "
                            + appointment.getStatus());
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setClinicalNotes(req.getClinicalNotes());
        appointment.setCompletedAt(LocalDateTime.now());
        appointmentRepository.save(appointment);

        return buildResponse(appointment, "Appointment completed. Clinical notes saved to pet record.");
    }

    // ── US-3.5.5: Mark No-Show ────────────────────────────────────────────
    @Transactional
    public AppointmentLifecycleResponse markNoShow(UUID appointmentId) {
        Appointment appointment = fetchAppointment(appointmentId);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException(
                    "Only CONFIRMED appointments can be marked as no-show. Current status: "
                            + appointment.getStatus());
        }

        // Only allowed after the scheduled appointment time
        LocalDateTime scheduledDateTime = LocalDateTime.of(
                appointment.getAppointmentDate(), appointment.getAppointmentTime());
        if (LocalDateTime.now().isBefore(scheduledDateTime)) {
            throw new IllegalStateException(
                    "No-show can only be marked after the scheduled appointment time.");
        }

        appointment.setStatus(AppointmentStatus.NO_SHOW);
        appointment.setNoShowCount(appointment.getNoShowCount() + 1);
        appointmentRepository.save(appointment);

        return buildResponse(appointment, "Appointment marked as no-show.");
    }

    // ── GET Appointment (for verification) ───────────────────────────────
    @Transactional(readOnly = true)
    public Appointment getAppointment(UUID appointmentId) {
        return fetchAppointment(appointmentId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private Appointment fetchAppointment(UUID appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", appointmentId));
    }

    private void validateCancellationWindow(Appointment appointment) {
        LocalDateTime scheduledDateTime = LocalDateTime.of(
                appointment.getAppointmentDate(), appointment.getAppointmentTime());
        LocalDateTime cutoff = scheduledDateTime.minusHours(appointment.getCancellationPolicyHours());
        if (LocalDateTime.now().isAfter(cutoff)) {
            throw new IllegalStateException(
                    "Cannot cancel/reschedule within " + appointment.getCancellationPolicyHours()
                            + " hour(s) of the appointment.");
        }
    }

    private AppointmentLifecycleResponse buildResponse(Appointment appointment, String message) {
        return new AppointmentLifecycleResponse(
                appointment.getId(),
                appointment.getStatus(),
                message,
                appointment.getUpdatedAt());
    }
}
