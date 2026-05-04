package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.hospital.dto.AppointmentMetricsResponse;
import com.cts.mfrp.petzbackend.hospital.dto.CreateHospitalRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DisableHospitalRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorManagementDtos.DoctorCreateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorResponse;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalResponse;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalVerificationRequest;
import com.cts.mfrp.petzbackend.hospital.dto.HospitalVerificationRequest.VerifyAction;
import com.cts.mfrp.petzbackend.hospital.enums.AppointmentStatus;
import com.cts.mfrp.petzbackend.hospital.model.Appointment;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.Doctor;
import com.cts.mfrp.petzbackend.hospital.model.HospitalAuditLog;
import com.cts.mfrp.petzbackend.hospital.repository.AppointmentRepository;
import com.cts.mfrp.petzbackend.hospital.repository.DoctorRepository;
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
    private final DoctorRepository doctorRepository;

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

    // ─── US-3.7.3 enable (re-activate) ───────────────────────────────

    @Transactional
    public HospitalResponse enableHospital(UUID hospitalId, UUID adminId) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", hospitalId));
        hospital.setVerified(true);
        hospitalRepository.save(hospital);
        auditLogRepository.save(HospitalAuditLog.builder()
                .hospitalId(hospitalId)
                .adminId(adminId != null ? adminId : UUID.fromString("00000000-0000-0000-0000-000000000000"))
                .action("ENABLED")
                .reason("Admin re-enabled hospital")
                .build());
        return HospitalResponse.from(hospital);
    }

    // ─── Admin: create hospital manually ─────────────────────────────

    @Transactional
    public HospitalResponse createHospital(UUID adminId, CreateHospitalRequest req) {
        Hospital hospital = Hospital.builder()
                .ownerId(adminId)
                .name(req.getName())
                .address(req.getAddress())
                .city(req.getCity())
                .contactPhone(req.getContactPhone())
                .contactEmail(req.getContactEmail())
                .operatingHours(req.getOperatingHours())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .emergencyReady(req.isEmergencyReady())
                .isVerified(true)
                .build();
        Hospital saved = hospitalRepository.save(hospital);
        auditLogRepository.save(HospitalAuditLog.builder()
                .hospitalId(saved.getId())
                .adminId(adminId != null ? adminId : UUID.fromString("00000000-0000-0000-0000-000000000000"))
                .action("ADMIN_CREATED")
                .reason("Hospital created by admin")
                .build());
        return HospitalResponse.from(saved);
    }

    // ─── Admin: add doctor to hospital ───────────────────────────────

    @Transactional
    public DoctorResponse addDoctor(UUID hospitalId, UUID adminId, DoctorCreateRequest req) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", hospitalId));
        Doctor doctor = Doctor.builder()
                .hospitalId(hospitalId)
                .hospital(hospital)
                .name(req.getName())
                .specialization(req.getSpecialization())
                .contactPhone(req.getContactPhone())
                .availability(req.getAvailability())
                .isActive(true)
                .build();
        Doctor saved = doctorRepository.save(doctor);
        return DoctorResponse.builder()
                .id(saved.getId())
                .hospitalId(saved.getHospitalId())
                .name(saved.getName())
                .specialization(saved.getSpecialization())
                .contactPhone(saved.getContactPhone())
                .availability(saved.getAvailability())
                .isActive(saved.isActive())
                .build();
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
