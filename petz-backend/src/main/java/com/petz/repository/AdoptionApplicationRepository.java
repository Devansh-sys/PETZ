package com.petz.repository;

import com.petz.entity.AdoptionApplication;
import com.petz.enums.AdoptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptionApplicationRepository extends JpaRepository<AdoptionApplication, Long> {
    List<AdoptionApplication> findByApplicantId(Long applicantId);
    List<AdoptionApplication> findByNgoId(Long ngoId);
    List<AdoptionApplication> findByAnimalId(Long animalId);
    List<AdoptionApplication> findByNgoIdAndStatus(Long ngoId, AdoptionStatus status);
    List<AdoptionApplication> findByApplicantIdAndStatus(Long applicantId, AdoptionStatus status);
    boolean existsByApplicantIdAndAnimalIdAndStatusNot(Long applicantId, Long animalId, AdoptionStatus status);
}
