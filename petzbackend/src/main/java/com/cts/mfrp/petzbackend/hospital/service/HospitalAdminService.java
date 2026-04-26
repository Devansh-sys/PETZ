package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentMetricsResponse;
import com.cts.mfrp.petzbackend.hospital.dto.DisableHospitalRequest;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalResponse;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalVerificationRequest;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalVerificationRequest.VerifyAction;
import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import com.cts.mfrp.petzbackend.hospital.model.Appointment;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalAuditLog;
import com.cts.mfrp.petzbackend.hospital.repository.AppointmentRepository;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalAuditLogRepository;
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
public class HospitalAdminService {

    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final HospitalAuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public List<HospitalResponse> getPendingRegistrations() {
        return hospitalRepository.findByIsVerifiedFalse().stream()
                .map(HospitalResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public HospitalResponse verifyHospital(UUID hospitalId, UUID adminId, HospitalVerificationRequest req) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", hospitalId));

        if (req.getAction() == VerifyAction.APPROVE) {
            hospital.setVerified(true);
        } else {
            hospital.setVerified(false);
        }

        hospitalRepository.save(hospital);

        auditLogRepository.save(HospitalAuditLog.builder()
                .hospitalId(hospitalId)
                .adminId(adminId != null ? adminId : UUID.fromString("00000000-0000-0000-0000-000000000000"))
                .action(req.getAction().name())
                .reason(req.getReason())
                .build());

        return HospitalResponse.from(hospital);
    }

    @Transactional(readOnly = true)
    public List<AppointmentMetricsResponse> getMetrics(UUID hospitalId, String city, LocalDate from, LocalDate to) {
        List<Hospital> hospitals;

        if (hospitalId != null) {
            hospitals = List.of(hospitalRepository.findById(hospitalId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hospital", hospitalId)));
        } else if (city != null) {
            hospitals = hospitalRepository.findByCityIgnoreCase(city);
        } else {
            hospitals = hospitalRepository.findAll();
        }

        LocalDate rangeFrom = from != null ? from : LocalDate.now().minusMonths(1);
        LocalDate rangeTo = to != null ? to : LocalDate.now();

        return hospitals.stream().map(h -> buildMetrics(h, rangeFrom, rangeTo)).collect(Collectors.toList());
    }

    @Transactional
    public void disableHospital(UUID hospitalId, UUID adminId, DisableHospitalRequest req) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", hospitalId));

        hospital.setVerified(false);
        hospitalRepository.save(hospital);

        List<Appointment> confirmedAppointments = appointmentRepository
                .findByHospitalIdAndStatus(hospitalId, AppointmentStatus.CONFIRMED);
        confirmedAppointments.forEach(a -> a.setStatus(AppointmentStatus.CANCELLED));
        appointmentRepository.saveAll(confirmedAppointments);

        auditLogRepository.save(HospitalAuditLog.builder()
                .hospitalId(hospitalId)
                .adminId(adminId != null ? adminId : UUID.fromString("00000000-0000-0000-0000-000000000000"))
                .action("DISABLED")
                .reason(req.getReason())
                .build());
    }

    private AppointmentMetricsResponse buildMetrics(Hospital h, LocalDate from, LocalDate to) {
        long total = appointmentRepository.countByHospitalIdAndAppointmentDateBetween(h.getId(), from, to);
        long completed = appointmentRepository.countByHospitalIdAndStatus(h.getId(), AppointmentStatus.COMPLETED);
        long cancelled = appointmentRepository.countByHospitalIdAndStatus(h.getId(), AppointmentStatus.CANCELLED);
        long noShow = appointmentRepository.countByHospitalIdAndStatus(h.getId(), AppointmentStatus.NO_SHOW);
        long attended = appointmentRepository.countByHospitalIdAndStatus(h.getId(), AppointmentStatus.ATTENDED);
        long confirmed = appointmentRepository.countByHospitalIdAndStatus(h.getId(), AppointmentStatus.CONFIRMED);

        return AppointmentMetricsResponse.builder()
                .hospitalId(h.getId())
                .hospitalName(h.getName())
                .city(h.getCity())
                .totalAppointments(total)
                .completedCount(completed)
                .cancelledCount(cancelled)
                .noShowCount(noShow)
                .attendedCount(attended)
                .confirmedCount(confirmed)
                .completionRate(total > 0 ? (double) completed / total * 100 : 0)
                .cancellationRate(total > 0 ? (double) cancelled / total * 100 : 0)
                .noShowRate(total > 0 ? (double) noShow / total * 100 : 0)
                .build();
    }
}
