package com.cts.mfrp.petzbackend.hospital.service;

import com.cts.mfrp.petzbackend.common.exception.ResourceNotFoundException;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorManagementDtos.DoctorCreateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorManagementDtos.DoctorServicesLinkRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorManagementDtos.DoctorUpdateRequest;
import com.cts.mfrp.petzbackend.hospital.dto.DoctorResponse;
import com.cts.mfrp.petzbackend.hospital.model.Doctor;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService;
import com.cts.mfrp.petzbackend.hospital.repository.DoctorRepository;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalRepository;
import com.cts.mfrp.petzbackend.hospital.repository.HospitalServiceRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * US-3.2.3 — "Manage Doctor Profiles".
 *
 *   AC#1 Add / edit / remove        → add / update / softDelete
 *   AC#2 name, specialization,
 *        availability profile       → fields on {@link Doctor}
 *   AC#3 Linked to services         → linkServices + doctor.services M2M
 *
 * Soft delete: appointments reference Doctor via FK-by-id, so removing a
 * doctor sets {@code isActive=false} rather than deleting the row. Listing
 * endpoints accept {@code ?activeOnly=true} to hide inactive doctors.
 */
@Service
@RequiredArgsConstructor
public class DoctorManagementService {

    private static final Logger log = LoggerFactory.getLogger(DoctorManagementService.class);

    private final HospitalRepository        hospitalRepo;
    private final DoctorRepository          doctorRepo;
    private final HospitalServiceRepository serviceRepo;

    // ── Queries ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DoctorResponse> listDoctors(UUID hospitalId, boolean activeOnly) {
        ensureHospitalExists(hospitalId);
        List<Doctor> doctors = activeOnly
                ? doctorRepo.findByHospitalIdAndIsActiveOrderByNameAsc(hospitalId, true)
                : doctorRepo.findByHospitalIdOrderByNameAsc(hospitalId);
        return doctors.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── US-3.2.3 AC#1 — Add ─────────────────────────────────────────

    @Transactional
    public DoctorResponse addDoctor(UUID hospitalId, DoctorCreateRequest req) {
        Hospital hospital = hospitalRepo.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital", hospitalId));

        Doctor doctor = Doctor.builder()
                .hospitalId(hospital.getId())
                .name(req.getName())
                .specialization(req.getSpecialization())
                .contactPhone(req.getContactPhone())
                .availability(req.getAvailability())
                .isActive(true)
                .services(new HashSet<>(resolveServices(hospitalId, req.getServiceIds())))
                .build();

        Doctor saved = doctorRepo.save(doctor);
        log.info("Doctor {} added to hospital {}", saved.getId(), hospitalId);
        return toResponse(saved);
    }

    // ── US-3.2.3 AC#1 — Edit ────────────────────────────────────────

    @Transactional
    public DoctorResponse updateDoctor(UUID hospitalId, UUID doctorId, DoctorUpdateRequest req) {
        Doctor doctor = doctorRepo.findByIdAndHospitalId(doctorId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor " + doctorId + " not found at hospital " + hospitalId));

        if (req.getName()           != null) doctor.setName(req.getName());
        if (req.getSpecialization() != null) doctor.setSpecialization(req.getSpecialization());
        if (req.getContactPhone()   != null) doctor.setContactPhone(req.getContactPhone());
        if (req.getAvailability()   != null) doctor.setAvailability(req.getAvailability());
        if (req.getIsActive()       != null) doctor.setActive(req.getIsActive());

        return toResponse(doctorRepo.save(doctor));
    }

    // ── US-3.2.3 AC#1 — Remove (soft delete) ────────────────────────

    @Transactional
    public void softDeleteDoctor(UUID hospitalId, UUID doctorId) {
        Doctor doctor = doctorRepo.findByIdAndHospitalId(doctorId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor " + doctorId + " not found at hospital " + hospitalId));
        doctor.setActive(false);
        doctorRepo.save(doctor);
        log.info("Doctor {} deactivated at hospital {}", doctorId, hospitalId);
    }

    // ── US-3.2.3 AC#3 — Link services ───────────────────────────────

    @Transactional
    public DoctorResponse linkServices(UUID hospitalId, UUID doctorId, DoctorServicesLinkRequest req) {
        Doctor doctor = doctorRepo.findByIdAndHospitalId(doctorId, hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor " + doctorId + " not found at hospital " + hospitalId));

        // Fully replace the linked-services set (PUT semantics).
        doctor.setServices(new HashSet<>(resolveServices(hospitalId, req.getServiceIds())));
        return toResponse(doctorRepo.save(doctor));
    }

    // ─── helpers ─────────────────────────────────────────────────────

    /**
     * Resolve service IDs under a specific hospital; throws if any ID
     * doesn't belong to that hospital (cross-hospital linking blocked).
     */
    private List<HospitalService> resolveServices(UUID hospitalId, List<UUID> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyList();
        List<HospitalService> found = serviceRepo.findAllByIdInAndHospital_Id(ids, hospitalId);
        if (found.size() != new HashSet<>(ids).size()) {
            Set<UUID> foundIds = found.stream()
                    .map(HospitalService::getId).collect(Collectors.toSet());
            List<UUID> missing = ids.stream()
                    .filter(id -> !foundIds.contains(id))
                    .collect(Collectors.toList());
            throw new ResourceNotFoundException(
                    "Services not found at hospital " + hospitalId + ": " + missing);
        }
        return found;
    }

    private void ensureHospitalExists(UUID hospitalId) {
        if (!hospitalRepo.existsById(hospitalId)) {
            throw new ResourceNotFoundException("Hospital", hospitalId);
        }
    }

    private DoctorResponse toResponse(Doctor d) {
        Set<HospitalService> services = d.getServices() != null ? d.getServices() : Set.of();
        return DoctorResponse.builder()
                .id(d.getId())
                .hospitalId(d.getHospitalId())
                .name(d.getName())
                .specialization(d.getSpecialization())
                .contactPhone(d.getContactPhone())
                .availability(d.getAvailability())
                .isActive(d.isActive())
                .serviceIds(services.stream()
                        .map(HospitalService::getId)
                        .collect(Collectors.toList()))
                .serviceNames(services.stream()
                        .map(HospitalService::getServiceName)
                        .collect(Collectors.toList()))
                .build();
    }
}
