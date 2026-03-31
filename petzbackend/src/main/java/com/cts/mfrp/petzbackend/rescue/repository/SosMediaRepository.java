// ============================================================
// FILE 10: rescue/repository/SosMediaRepository.java
// ============================================================
package com.cts.mfrp.petzbackend.rescue.repository;

import com.cts.mfrp.petzbackend.rescue.model.SosMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SosMediaRepository extends JpaRepository<SosMedia, UUID> {
}
