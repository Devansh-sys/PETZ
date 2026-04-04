
// ─────────────────────────────────────────────
// FILE 6: hospital/repository/HospitalRepository.java
// ─────────────────────────────────────────────
package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface HospitalRepository extends JpaRepository<Hospital, UUID> {

    List<Hospital> findByIsVerifiedTrue();

    List<Hospital> findByIsVerifiedTrueAndEmergencyReady(boolean emergencyReady);

    List<Hospital> findByIsVerifiedTrueAndIsOpenNow(boolean isOpenNow);

    List<Hospital> findByIsVerifiedTrueAndEmergencyReadyAndIsOpenNow(
            boolean emergencyReady, boolean isOpenNow);

    List<Hospital> findByIsVerifiedTrueAndNameContainingIgnoreCase(String name);

    List<Hospital> findByIsVerifiedTrueAndCityIgnoreCase(String city);

    @Query("SELECT DISTINCT h FROM Hospital h JOIN h.services s " +
            "WHERE h.isVerified = true AND s.serviceType = :serviceType")
    List<Hospital> findVerifiedByServiceType(@Param("serviceType") ServiceType serviceType);
}
