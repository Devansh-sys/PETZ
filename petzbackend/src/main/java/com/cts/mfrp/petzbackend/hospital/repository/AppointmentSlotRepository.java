
// ─────────────────────────────────────────────
// FILE 9: hospital/repository/AppointmentSlotRepository.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.AppointmentSlot;
import com.cts.mfrp.petzbackend.hospital.model.AppointmentSlot.SlotStatus;
import com.cts.mfrp.petzbackend.hospital.model.Doctor;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentSlotRepository extends JpaRepository<AppointmentSlot, UUID> {

    List<AppointmentSlot> findByHospitalAndSlotDate(Hospital hospital, LocalDate date);

    List<AppointmentSlot> findByHospitalAndDoctorAndSlotDate(
            Hospital hospital, Doctor doctor, LocalDate date);

    @Query("SELECT s FROM AppointmentSlot s " +
            "WHERE s.hospital = :hospital AND s.doctor = :doctor " +
            "AND s.slotDate = :date " +
            "AND s.startTime < :endTime AND s.endTime > :startTime")
    List<AppointmentSlot> findOverlappingSlots(
            @Param("hospital")  Hospital hospital,
            @Param("doctor")    Doctor doctor,
            @Param("date")      LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime")   LocalTime endTime);

    @Query("SELECT COUNT(s) FROM AppointmentSlot s " +
            "WHERE s.hospital = :hospital " +
            "AND s.slotDate BETWEEN :from AND :to " +
            "AND s.slotStatus = :status")
    long countByHospitalAndDateRangeAndStatus(
            @Param("hospital") Hospital hospital,
            @Param("from")     LocalDate from,
            @Param("to")       LocalDate to,
            @Param("status")   SlotStatus status);

    @Query("SELECT s FROM AppointmentSlot s " +
            "WHERE s.hospital = :hospital " +
            "AND s.slotDate BETWEEN :from AND :to")
    List<AppointmentSlot> findByHospitalAndDateRange(
            @Param("hospital") Hospital hospital,
            @Param("from")     LocalDate from,
            @Param("to")       LocalDate to);

    @Query("SELECT s FROM AppointmentSlot s " +
            "WHERE s.hospital = :hospital " +
            "AND s.slotDate = :date AND s.slotStatus = 'AVAILABLE'")
    List<AppointmentSlot> findAvailableSlotsByHospitalAndDate(
            @Param("hospital") Hospital hospital,
            @Param("date")     LocalDate date);
}

