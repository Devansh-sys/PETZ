package com.cts.mfrp.petzbackend.common.util;

import com.cts.mfrp.petzbackend.notification.model.SmsDeliveryLog;
import com.cts.mfrp.petzbackend.notification.repository.SmsDeliveryLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * US-4.2.2 — upgraded SMS stub.
 *
 * Previously: log-only.
 * Now: log PLUS write an {@link SmsDeliveryLog} row so admins can audit
 * every SMS attempt in the DB without grepping logs.
 *
 * Replace with a real provider adapter (Twilio, MSG91, etc.) before
 * production. Mark the real impl {@code @Primary} so Spring picks it up.
 */
@Service
@RequiredArgsConstructor
public class SmsServiceStub implements SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsServiceStub.class);

    private final SmsDeliveryLogRepository smsLogRepo;

    @Override
    public boolean sendSms(String phone, String message) {
        log.info("═══════════════════════════════════════════");
        log.info("  SMS STUB → To: {}", phone);
        log.info("  Message: {}", message);
        log.info("═══════════════════════════════════════════");

        // Persist delivery log — always SENT for the stub (no real failure path).
        try {
            SmsDeliveryLog entry = SmsDeliveryLog.builder()
                    .phone(phone)
                    .message(message)
                    .status(SmsDeliveryLog.SmsStatus.SENT)
                    .provider("STUB")
                    .build();
            smsLogRepo.save(entry);
        } catch (Exception ex) {
            // Log-only — never let a DB write break the OTP flow.
            log.warn("[SmsStub] Failed to persist delivery log: {}", ex.getMessage());
        }

        return true;
    }
}
