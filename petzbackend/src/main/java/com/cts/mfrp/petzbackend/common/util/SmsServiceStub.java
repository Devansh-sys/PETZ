package com.cts.mfrp.petzbackend.common.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Development stub for SMS delivery.
 * Logs OTP to console instead of sending real SMS.
 *
 * Replace with real implementation (Twilio, MSG91, etc.) before production.
 * The @Service annotation ensures Spring picks this up as the default.
 * When you create a real implementation, use @Primary on it.
 */
@Service
public class SmsServiceStub implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsServiceStub.class);

    @Override
    public boolean sendSms(String phone, String message) {
        log.info("═══════════════════════════════════════════");
        log.info("  SMS STUB → To: {}",  phone);
        log.info("  Message: {}", message);
        log.info("═══════════════════════════════════════════");
        return true;
    }
}