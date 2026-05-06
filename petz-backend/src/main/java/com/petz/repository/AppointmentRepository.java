package com.petz.repository;

import com.petz.entity.Appointment;
import com.petz.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUserId(Long userId);
    List<Appointment> findByHospitalId(Long hospitalId);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByDoctorIdAndApptDate(Long doctorId, LocalDate date);
    List<Appointment> findByDoctorIdAndApptDateAndStatus(Long doctorId, LocalDate date, AppointmentStatus status);
    List<Appointment> findByHospitalIdAndApptDate(Long hospitalId, LocalDate date);
    boolean existsByDoctorIdAndApptDateAndApptTimeAndStatusNot(
            Long doctorId, LocalDate date, LocalTime time, AppointmentStatus status);
    List<Appointment> findByUserIdAndStatus(Long userId, AppointmentStatus status);
    List<Appointment> findByHospitalIdAndStatus(Long hospitalId, AppointmentStatus status);
}
