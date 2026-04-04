package com.cts.mfrp.petzbackend.hospital.repository;

import com.cts.mfrp.petzbackend.hospital.model.HospitalAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HospitalAuditLogRepository extends JpaRepository<HospitalAuditLog, UUID> {

    List<HospitalAuditLog> findByHospitalIdOrderByPerformedAtDesc(UUID hospitalId);
}
