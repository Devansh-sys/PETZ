package com.cts.mfrp.petzbackend.common.exception;

import com.cts.mfrp.petzbackend.common.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.stream.Collectors;

/**
 * Global exception handler for ALL modules.
 *
 * TEAMMATES: Add your module-specific exception handlers here.
 * Keep them grouped by module with clear section comments.
 * Do NOT create separate @RestControllerAdvice classes — only one
 * should exist to avoid unpredictable handler ordering.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ─── Validation Errors (all modules) ─────────────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));

        return ResponseEntity.badRequest().body(
                ApiErrorResponse.of(400, "Validation Failed", errors, request.getRequestURI())
        );
    }

    // ─── Auth Exceptions (Epic 1.1) ──────────────────────────────────────

    @ExceptionHandler(AuthExceptions.OtpExpiredException.class)
    public ResponseEntity<ApiErrorResponse> handleOtpExpired(
            AuthExceptions.OtpExpiredException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.GONE).body(
                ApiErrorResponse.of(410, "OTP Expired", ex.getMessage(), request.getRequestURI())
        );
    }

    @ExceptionHandler(AuthExceptions.InvalidOtpException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidOtp(
            AuthExceptions.InvalidOtpException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiErrorResponse.of(401, "Invalid OTP", ex.getMessage(), request.getRequestURI())
        );
    }

    @ExceptionHandler(AuthExceptions.OtpAttemptsExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleOtpAttemptsExceeded(
            AuthExceptions.OtpAttemptsExceededException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                ApiErrorResponse.of(429, "Attempts Exceeded", ex.getMessage(), request.getRequestURI())
        );
    }

    @ExceptionHandler(AuthExceptions.OtpRateLimitException.class)
    public ResponseEntity<ApiErrorResponse> handleOtpRateLimit(
            AuthExceptions.OtpRateLimitException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(
                ApiErrorResponse.of(429, "Rate Limited", ex.getMessage(), request.getRequestURI())
        );
    }

    @ExceptionHandler(AuthExceptions.MissedCallVerificationFailedException.class)
    public ResponseEntity<ApiErrorResponse> handleMissedCallFailed(
            AuthExceptions.MissedCallVerificationFailedException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                ApiErrorResponse.of(401, "Verification Failed", ex.getMessage(), request.getRequestURI())
        );
    }

    // ─── Epic 3.4: Booking / Slot Locking Errors ────────────────────────

    /**
     * Handles slot-unavailable, lock-expired, and ownership violations thrown
     * as IllegalStateException or IllegalArgumentException from AppointmentService
     * and SlotLockService (US-3.4.1, US-3.4.2, US-3.4.3).
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalState(
            IllegalStateException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiErrorResponse.of(409, "Conflict", ex.getMessage(), request.getRequestURI())
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiErrorResponse.of(400, "Bad Request", ex.getMessage(), request.getRequestURI())
        );
    }

    /**
     * Safety net for any DataIntegrityViolationException that escapes a service method
     * (e.g. if saveAndFlush is not used and the constraint fires at commit time).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("DataIntegrityViolation at {}: {}", request.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiErrorResponse.of(409, "Conflict", "Slot Unavailable: concurrent booking detected", request.getRequestURI())
        );
    }

    // ─── Invalid path/query parameter types (e.g. non-UUID passed as UUID) ─

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String message = String.format("Invalid value '%s' for parameter '%s' — expected %s",
                ex.getValue(), ex.getName(),
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "correct type");
        return ResponseEntity.badRequest().body(
                ApiErrorResponse.of(400, "Bad Request", message, request.getRequestURI())
        );
    }

    // ─── Catch-all ───────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiErrorResponse.of(500, "Internal Server Error",
                        "Something went wrong. Please try again.", request.getRequestURI())
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiErrorResponse.of(404, "Not Found", ex.getMessage(), request.getRequestURI())
        );
    }
    @ExceptionHandler(FileValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleFileValidation(
            FileValidationException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiErrorResponse.of(400, "File Validation Failed", ex.getMessage(), request.getRequestURI())
        );
    }
}