package com.cts.mfrp.petzbackend.common.config;

import com.cts.mfrp.petzbackend.user.repository.OtpVerificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Scheduled cleanup for expired OTP records.
 * Without this, the otp_verifications table grows forever.
 *
 * Runs every 30 minutes. Deletes all OTPs past their expiry time.
 */
@Component
@EnableScheduling
public class OtpCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(OtpCleanupScheduler.class);

    private final OtpVerificationRepository otpRepo;

    public OtpCleanupScheduler(OtpVerificationRepository otpRepo) {
        this.otpRepo = otpRepo;
    }

    @Scheduled(fixedRate = 1800000) // 30 minutes in milliseconds
    @Transactional
    public void purgeExpiredOtps() {
        int deleted = otpRepo.deleteExpiredOtps(LocalDateTime.now());
        if (deleted > 0) {
            log.info("OTP cleanup: purged {} expired records", deleted);
        }
    }
}