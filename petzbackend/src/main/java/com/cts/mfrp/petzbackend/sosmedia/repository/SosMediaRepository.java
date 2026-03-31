package com.cts.mfrp.petzbackend.sosmedia.repository;

import com.cts.mfrp.petzbackend.sosmedia.model.SosMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SosMediaRepository extends JpaRepository<SosMedia, UUID> {

    List<SosMedia> findBySosReportId(UUID sosReportId);

    long countBySosReportId(UUID sosReportId);
}