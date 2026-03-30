package com.cts.mfrp.petzbackend.common.util;

/**
 * SMS delivery abstraction.
 *
 * Currently a stub that logs to console. Replace the implementation
 * with Twilio, MSG91, or any SMS gateway when ready.
 *
 * TEAMMATES: Do NOT call SMS gateways directly from service classes.
 * Always go through this interface so we can swap providers cleanly.
 */
public interface SmsService {

    /**
     * Send an SMS to the given phone number.
     *
     * @param phone   recipient phone in E.164 format (e.g., +919876543210)
     * @param message the text content
     * @return true if queued/sent successfully, false on failure
     */
    boolean sendSms(String phone, String message);
}