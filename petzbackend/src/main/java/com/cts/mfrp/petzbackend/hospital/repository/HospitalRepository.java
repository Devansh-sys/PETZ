package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, UUID> {

    // Navya's original methods
    List<Hospital> findByIsVerifiedTrue();
    List<Hospital> findByIsVerifiedTrueAndCityIgnoreCase(String city);
    List<Hospital> findByIsVerifiedTrueAndEmergencyReadyTrue();
    List<Hospital> findByIsVerifiedTrueAndIsOpenNowTrue();

    // Sreeja — pending registrations (US-3.7.1)
    List<Hospital> findByIsVerifiedFalse();

    // Sreeja — metrics by city (US-3.7.2)
    List<Hospital> findByCityIgnoreCase(String city);
}
