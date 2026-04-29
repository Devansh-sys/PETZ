
package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.Hospital;
import com.cts.mfrp.petzbackend.hospital.model.HospitalService.ServiceType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HospitalRepository extends JpaRepository<Hospital, UUID> {

    // ── List queries — @EntityGraph eagerly loads services to avoid N+1 on serviceCount ──

    @EntityGraph(attributePaths = {"services"})
    List<Hospital> findByIsVerifiedTrue();

    @EntityGraph(attributePaths = {"services"})
    List<Hospital> findByIsVerifiedTrueAndEmergencyReady(boolean emergencyReady);

    @EntityGraph(attributePaths = {"services"})
    List<Hospital> findByIsVerifiedTrueAndIsOpenNow(boolean isOpenNow);

    @EntityGraph(attributePaths = {"services"})
    List<Hospital> findByIsVerifiedTrueAndEmergencyReadyAndIsOpenNow(
            boolean emergencyReady, boolean isOpenNow);

    @EntityGraph(attributePaths = {"services"})
    List<Hospital> findByIsVerifiedTrueAndNameContainingIgnoreCase(String name);

    @EntityGraph(attributePaths = {"services"})
    List<Hospital> findByIsVerifiedTrueAndCityIgnoreCase(String city);

    @EntityGraph(attributePaths = {"services"})
    @Query("SELECT DISTINCT h FROM Hospital h JOIN h.services s " +
           "WHERE h.isVerified = true AND s.serviceType = :serviceType")
    List<Hospital> findVerifiedByServiceType(@Param("serviceType") ServiceType serviceType);

    // ── Profile endpoint — loads services and doctors eagerly ──
    @EntityGraph(attributePaths = {"services", "doctors"})
    Optional<Hospital> findById(UUID id);

    // ── Admin endpoints ──
    List<Hospital> findByIsVerifiedFalse();
    List<Hospital> findByCityIgnoreCase(String city);
}
