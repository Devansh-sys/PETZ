package com.cts.mfrp.petzbackend.common.exception;

/**
 * Custom exceptions for the PETZ platform.
 *
 * TEAMMATES: Add new exception classes here rather than creating
 * per-module exception files. Keeps the global handler in one place.
 */

// ─── Auth Exceptions ─────────────────────────────────────────────────────

public class AuthExceptions {

    private AuthExceptions() {}

    /** OTP has expired or does not exist */
    public static class OtpExpiredException extends RuntimeException {
        public OtpExpiredException() {
            super("OTP has expired or does not exist. Please request a new one.");
        }
    }

    /** OTP value does not match */
    public static class InvalidOtpException extends RuntimeException {
        public InvalidOtpException() {
            super("Invalid OTP. Please check and try again.");
        }
    }

    /** Too many wrong OTP attempts — locked */
    public static class OtpAttemptsExceededException extends RuntimeException {
        public OtpAttemptsExceededException() {
            super("Too many incorrect attempts. Please request a new OTP.");
        }
    }

    /** Too many OTP requests in short window — prevents SMS bombing */
    public static class OtpRateLimitException extends RuntimeException {
        public OtpRateLimitException() {
            super("Too many OTP requests. Please wait before trying again.");
        }
    }

    /** Missed call verification failed */
    public static class MissedCallVerificationFailedException extends RuntimeException {
        public MissedCallVerificationFailedException() {
            super("Missed call verification failed. Please try again.");
        }
    }
}