package com.petz.repository;

import com.petz.entity.AdoptableAnimal;
import com.petz.enums.AnimalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptableAnimalRepository extends JpaRepository<AdoptableAnimal, Long> {
    List<AdoptableAnimal> findByNgoId(Long ngoId);
    List<AdoptableAnimal> findByStatus(AnimalStatus status);
    List<AdoptableAnimal> findByStatusAndCity(AnimalStatus status, String city);
    List<AdoptableAnimal> findByStatusAndSpecies(AnimalStatus status, String species);
    List<AdoptableAnimal> findByNgoIdAndStatus(Long ngoId, AnimalStatus status);
}
