package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentHistoryResponse;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalDashboardResponse;
import com.cts.mfrp.petzbackend.hospital.model.Appointment;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.repository.AppointmentRepository;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentHistoryService {

    private final AppointmentRepository appointmentRepository;
    private final HospitalRepository hospitalRepository;

    @Transactional(readOnly = true)
    public List<AppointmentHistoryResponse> getUserHistory(
            UUID userId, UUID petId, UUID hospitalId, LocalDate from, LocalDate to) {

        List<Appointment> appointments;

        if (petId != null && from != null && to != null) {
            appointments = appointmentRepository.findByUserIdAndPetIdAndAppointmentDateBetweenOrderByAppointmentDateDesc(userId, petId, from, to);
        } else if (petId != null) {
            appointments = appointmentRepository.findByUserIdAndPetIdOrderByAppointmentDateDesc(userId, petId);
        } else if (hospitalId != null) {
            appointments = appointmentRepository.findByUserIdAndHospitalIdOrderByAppointmentDateDesc(userId, hospitalId);
        } else if (from != null && to != null) {
            appointments = appointmentRepository.findByUserIdAndAppointmentDateBetweenOrderByAppointmentDateDesc(userId, from, to);
        } else {
            appointments = appointmentRepository.findByUserIdOrderByAppointmentDateDesc(userId);
        }

        return appointments.stream().map(this::toHistoryResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HospitalDashboardResponse getHospitalDashboard(UUID hospitalId, UUID doctorId) {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate weekEnd = today.plusDays(8);

        List<Appointment> todayAppointments;
        List<Appointment> upcomingAppointments;

        if (doctorId != null) {
            todayAppointments = appointmentRepository.findByHospitalIdAndDoctorIdAndAppointmentDateOrderByAppointmentTimeAsc(hospitalId, doctorId, today);
            upcomingAppointments = appointmentRepository.findByHospitalIdAndDoctorIdAndAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(hospitalId, doctorId, tomorrow, weekEnd);
        } else {
            todayAppointments = appointmentRepository.findByHospitalIdAndAppointmentDateOrderByAppointmentTimeAsc(hospitalId, today);
            upcomingAppointments = appointmentRepository.findByHospitalIdAndAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(hospitalId, tomorrow, weekEnd);
        }

        return HospitalDashboardResponse.builder()
                .todayAppointments(todayAppointments.stream().map(this::toSlot).collect(Collectors.toList()))
                .upcomingAppointments(upcomingAppointments.stream().map(this::toSlot).collect(Collectors.toList()))
                .build();
    }

    private AppointmentHistoryResponse toHistoryResponse(Appointment a) {
        Hospital hospital = hospitalRepository.findById(a.getHospitalId())
                .orElse(null);

        return AppointmentHistoryResponse.builder()
                .appointmentId(a.getId())
                .petId(a.getPetId())
                .hospitalId(a.getHospitalId())
                .hospitalName(hospital != null ? hospital.getName() : null)
                .hospitalCity(hospital != null ? hospital.getCity() : null)
                .doctorId(a.getDoctorId())
                .serviceType(a.getServiceType())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus())
                .clinicalNotes(a.getClinicalNotes())
                .build();
    }

    private HospitalDashboardResponse.AppointmentSlot toSlot(Appointment a) {
        return HospitalDashboardResponse.AppointmentSlot.builder()
                .appointmentId(a.getId())
                .petId(a.getPetId())
                .doctorId(a.getDoctorId())
                .serviceType(a.getServiceType())
                .appointmentDate(a.getAppointmentDate())
                .appointmentTime(a.getAppointmentTime())
                .status(a.getStatus())
                .build();
    }
}
