
// ─────────────────────────────────────────────
// FILE 10: hospital/repository/BlackoutDateRepository.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.BlackoutDate;
import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlackoutDateRepository extends JpaRepository<BlackoutDate, UUID> {

    List<BlackoutDate> findByHospital(Hospital hospital);

    Optional<BlackoutDate> findByHospitalAndBlackoutDate(Hospital hospital, LocalDate date);

    boolean existsByHospitalAndBlackoutDate(Hospital hospital, LocalDate date);
}