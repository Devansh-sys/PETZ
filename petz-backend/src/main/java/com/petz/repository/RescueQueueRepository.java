package com.petz.repository;

import com.petz.entity.RescueQueue;
import com.petz.enums.QueueResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RescueQueueRepository extends JpaRepository<RescueQueue, Long> {
    Optional<RescueQueue> findByRescueId(Long rescueId);
    List<RescueQueue> findByNgoId(Long ngoId);
    List<RescueQueue> findByResponse(QueueResponse response);
    List<RescueQueue> findByResponseAndExpiresAtBefore(QueueResponse response, LocalDateTime time);
}
