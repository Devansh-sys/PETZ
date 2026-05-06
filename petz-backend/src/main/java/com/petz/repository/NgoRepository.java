package com.petz.repository;

import com.petz.entity.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NgoRepository extends JpaRepository<Ngo, Long> {
    Optional<Ngo> findByOwnerUserId(Long ownerUserId);
    List<Ngo> findByIsActive(Boolean isActive);
    List<Ngo> findByIsVerified(Boolean isVerified);
    List<Ngo> findByCity(String city);
}
