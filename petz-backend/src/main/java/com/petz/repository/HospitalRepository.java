package com.petz.repository;

import com.petz.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByOwnerUserId(Long ownerUserId);
    List<Hospital> findByIsActive(Boolean isActive);
    List<Hospital> findByCity(String city);
    List<Hospital> findByCityAndIsActive(String city, Boolean isActive);
}
