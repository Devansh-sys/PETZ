package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import com.cts.mfrp.petzbackend.hospital.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalTime;
import org.springframework.data.repository.query.Param;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    // Gobika's original methods
    List<Appointment> findByUserIdAndStatus(UUID userId, AppointmentStatus status);
    List<Appointment> findByHospitalIdAndStatus(UUID hospitalId, AppointmentStatus status);
    boolean existsBySlotIdAndStatusNot(UUID slotId, AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.status = 'CONFIRMED' AND a.appointmentDate < :cutoff")
    List<Appointment> findOverdueConfirmed(LocalDateTime cutoff);

    // Sreeja — user appointment history (US-3.6.1)
    List<Appointment> findByUserIdOrderByAppointmentDateDesc(UUID userId);
    List<Appointment> findByUserIdAndPetIdOrderByAppointmentDateDesc(UUID userId, UUID petId);
    List<Appointment> findByUserIdAndHospitalIdOrderByAppointmentDateDesc(UUID userId, UUID hospitalId);
    List<Appointment> findByUserIdAndAppointmentDateBetweenOrderByAppointmentDateDesc(UUID userId, LocalDate from, LocalDate to);
    List<Appointment> findByUserIdAndPetIdAndAppointmentDateBetweenOrderByAppointmentDateDesc(UUID userId, UUID petId, LocalDate from, LocalDate to);

    // Sreeja — hospital dashboard (US-3.6.2)
    List<Appointment> findByHospitalIdAndAppointmentDateOrderByAppointmentTimeAsc(UUID hospitalId, LocalDate date);
    List<Appointment> findByHospitalIdAndDoctorIdAndAppointmentDateOrderByAppointmentTimeAsc(UUID hospitalId, UUID doctorId, LocalDate date);
    List<Appointment> findByHospitalIdAndAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(UUID hospitalId, LocalDate from, LocalDate to);
    List<Appointment> findByHospitalIdAndDoctorIdAndAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(UUID hospitalId, UUID doctorId, LocalDate from, LocalDate to);

    // Sreeja — metrics (US-3.7.2)
    long countByHospitalIdAndAppointmentDateBetween(UUID hospitalId, LocalDate from, LocalDate to);
    long countByHospitalIdAndStatus(UUID hospitalId, AppointmentStatus status);

    // Slot management queries (migrated from AppointmentSlotRepository)
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
