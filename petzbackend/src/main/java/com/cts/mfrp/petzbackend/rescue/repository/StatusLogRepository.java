
// ============================================================
// FILE 11: rescue/repository/StatusLogRepository.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.repository;

import com.cts.mfrp.petzbackend.rescue.model.StatusLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StatusLogRepository extends JpaRepository<StatusLog, UUID> {
}
