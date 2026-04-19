package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import com.cts.mfrp.petzbackend.hospital.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // ── US-3.5.1 / US-3.5.2 — User Management ─────────────────────────
    List<Appointment> findByUserIdAndStatus(UUID userId, AppointmentStatus status);

    // ── US-3.5.5 — Overdue Logic (Merged Versions) ────────────────────

    /**
     * Legacy Version: Uses separate Date and Time (Snippet 1 logic)
     */
    @Query("SELECT a FROM Appointment a WHERE a.status = 'CONFIRMED' " +
            "AND a.appointmentDate = :date AND a.appointmentTime < :time")
    List<Appointment> findOverdueConfirmed(@Param("date") LocalDate date,
                                           @Param("time") LocalTime time);

    /**
     * Primary Version: Uses LocalDateTime cutoff (Snippet 2 logic)
     */
    @Query("SELECT a FROM Appointment a WHERE a.status = 'CONFIRMED' AND a.appointmentDate < :cutoff")
    List<Appointment> findOverdueConfirmed(@Param("cutoff") LocalDateTime cutoff);

    // ── Hospital View (US-3.5.3 / 3.5.4 / 3.5.5) ───────────────────────
    List<Appointment> findByHospitalIdAndStatus(UUID hospitalId, AppointmentStatus status);

    // Check slot is not double-booked (for reschedule — US-3.5.2)
    boolean existsBySlotIdAndStatusNot(UUID slotId, AppointmentStatus status);

    // ── Sreeja — User Appointment History (US-3.6.1) ───────────────────
    List<Appointment> findByUserIdOrderByAppointmentDateDesc(UUID userId);
    List<Appointment> findByUserIdAndPetIdOrderByAppointmentDateDesc(UUID userId, UUID petId);
    List<Appointment> findByUserIdAndHospitalIdOrderByAppointmentDateDesc(UUID userId, UUID hospitalId);
    List<Appointment> findByUserIdAndAppointmentDateBetweenOrderByAppointmentDateDesc(UUID userId, LocalDate from, LocalDate to);
    List<Appointment> findByUserIdAndPetIdAndAppointmentDateBetweenOrderByAppointmentDateDesc(UUID userId, UUID petId, LocalDate from, LocalDate to);

    // ── Sreeja — Hospital Dashboard (US-3.6.2) ─────────────────────────
    List<Appointment> findByHospitalIdAndAppointmentDateOrderByAppointmentTimeAsc(UUID hospitalId, LocalDate date);
    List<Appointment> findByHospitalIdAndDoctorIdAndAppointmentDateOrderByAppointmentTimeAsc(UUID hospitalId, UUID doctorId, LocalDate date);
    List<Appointment> findByHospitalIdAndAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(UUID hospitalId, LocalDate from, LocalDate to);
    List<Appointment> findByHospitalIdAndDoctorIdAndAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(UUID hospitalId, UUID doctorId, LocalDate from, LocalDate to);

    // ── Sreeja — Metrics (US-3.7.2) ────────────────────────────────────
    long countByHospitalIdAndAppointmentDateBetween(UUID hospitalId, LocalDate from, LocalDate to);
    long countByHospitalIdAndStatus(UUID hospitalId, AppointmentStatus status);

    // ── Slot Management (Snippet 2 Specific) ───────────────────────────
    @Query("SELECT a FROM Appointment a " +
            "WHERE a.hospitalId = :hospitalId AND a.doctorId = :doctorId " +
            "AND a.appointmentDate = :date " +
            "AND a.appointmentTime < :endTime AND a.endTime > :startTime")
    List<Appointment> findOverlappingAppointments(
            @Param("hospitalId") UUID hospitalId,
            @Param("doctorId")   UUID doctorId,
            @Param("date")       LocalDate date,
            @Param("startTime")  LocalTime startTime,
            @Param("endTime")    LocalTime endTime);

    List<Appointment> findByHospitalIdAndAppointmentDateAndSlotStatus(
            UUID hospitalId, LocalDate date, Appointment.SlotStatus slotStatus);
}