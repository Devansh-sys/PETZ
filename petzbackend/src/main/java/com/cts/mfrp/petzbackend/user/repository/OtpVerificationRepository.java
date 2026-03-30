package com.cts.mfrp.petzbackend.user.repository;

import com.cts.mfrp.petzbackend.user.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {

    /**
     * Find the latest unverified, unexpired OTP for a given phone.
     * Used during the verification step of US-1.1.2.
     */
    Optional<OtpVerification> findFirstByPhoneAndVerifiedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
            String phone, LocalDateTime now
    );

    /**
     * Count OTP requests in last N minutes — prevents SMS bombing.
     */
    long countByPhoneAndCreatedAtAfter(String phone, LocalDateTime since);

    /**
     * Cleanup expired OTPs — called by scheduled job.
     */
    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.expiresAt < :now")
    int deleteExpiredOtps(@Param("now") LocalDateTime now);
}