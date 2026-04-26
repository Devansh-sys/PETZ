
// ─────────────────────────────────────────────
// FILE 8: hospital/repository/DoctorRepository.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.Doctor;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DoctorRepository extends JpaRepository<Doctor, UUID> {
    List<Doctor> findByHospitalAndIsActive(Hospital hospital, boolean isActive);

    // ── US-3.2.3: Hospital-scoped doctor lookups ─────────────────────────
    /** All doctors (active + inactive) for a hospital, newest first. */
    List<Doctor> findByHospitalIdOrderByNameAsc(UUID hospitalId);

    /** Only active doctors at a hospital. */
    List<Doctor> findByHospitalIdAndIsActiveOrderByNameAsc(UUID hospitalId, boolean isActive);

    /** Strict ownership lookup — ensures the doctor actually belongs to the hospital. */
    Optional<Doctor> findByIdAndHospitalId(UUID id, UUID hospitalId);
}