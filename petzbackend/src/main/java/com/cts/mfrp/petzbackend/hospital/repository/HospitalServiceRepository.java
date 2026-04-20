
// ─────────────────────────────────────────────
// FILE 7: hospital/repository/HospitalServiceRepository.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HospitalServiceRepository extends JpaRepository<HospitalService, UUID> {
    List<HospitalService> findByHospital(Hospital hospital);

    // ── US-3.2.2: Hospital-scoped service lookups ────────────────────────
    /** All services offered by a given hospital. */
    List<HospitalService> findByHospital_IdOrderByServiceNameAsc(UUID hospitalId);

    /** Strict ownership lookup — service must belong to the hospital. */
    Optional<HospitalService> findByIdAndHospital_Id(UUID id, UUID hospitalId);

    /** Batch fetch used when linking a doctor to multiple services (US-3.2.3 AC#3). */
    List<HospitalService> findAllByIdInAndHospital_Id(Collection<UUID> ids, UUID hospitalId);
}