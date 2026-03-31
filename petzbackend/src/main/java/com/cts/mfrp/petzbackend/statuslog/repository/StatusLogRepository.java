package com.cts.mfrp.petzbackend.statuslog.repository;

import com.cts.mfrp.petzbackend.statuslog.model.StatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StatusLogRepository extends JpaRepository<StatusLog, UUID> {

    List<StatusLog> findBySosReportIdOrderByUpdatedAtAsc(UUID sosReportId);
}