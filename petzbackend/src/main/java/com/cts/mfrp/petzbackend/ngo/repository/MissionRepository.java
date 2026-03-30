package com.cts.mfrp.petzbackend.ngo.repository;

import com.cts.mfrp.petzbackend.ngo.model.Mission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findByStatus(String status);
}
