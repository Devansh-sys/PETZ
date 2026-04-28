package com.cts.mfrp.petzbackend.notification.repository;

import com.cts.mfrp.petzbackend.notification.model.SmsDeliveryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * US-4.2.2 — data access for SMS delivery audit trail.
 */
public interface SmsDeliveryLogRepository extends JpaRepository<SmsDeliveryLog, UUID> {

    /** All logs for a given phone number, newest first. */
    Page<SmsDeliveryLog> findByPhoneOrderBySentAtDesc(String phone, Pageable pageable);

    /** Count failed SMS sends for a phone (useful for alerting). */
    long countByPhoneAndStatus(String phone, SmsDeliveryLog.SmsStatus status);
}
