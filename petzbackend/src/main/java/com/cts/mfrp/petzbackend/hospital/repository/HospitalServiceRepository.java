
// ─────────────────────────────────────────────
// FILE 7: hospital/repository/HospitalServiceRepository.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HospitalServiceRepository extends JpaRepository<HospitalService, UUID> {
    List<HospitalService> findByHospital(Hospital hospital);
}