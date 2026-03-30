package com.cts.mfrp.petzbackend.ngo.repository;

import com.cts.mfrp.petzbackend.ngo.model.StatusLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StatusLogRepository extends JpaRepository<StatusLog, Long> {
}
