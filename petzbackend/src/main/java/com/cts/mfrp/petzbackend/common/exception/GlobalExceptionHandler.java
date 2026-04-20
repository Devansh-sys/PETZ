package com.cts.mfrp.petzbackend.common.exception;

import com.cts.mfrp.petzbackend.common.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.NoSuchElementException;
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

    // ─── Booking conflicts / validation (Epic 3.4) ───────────────────────

    /**
     * {@link IllegalStateException} is used by the booking service for
     * "Slot Unavailable" / "Slot lock expired" / "pet not emergency slot"
     * and similar state-machine errors. Surface as 409 Conflict so
     * clients can distinguish from a true server failure.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalState(
            IllegalStateException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiErrorResponse.of(409, "Conflict", ex.getMessage(), request.getRequestURI())
        );
    }

    /** Bad user input (enum parse, wrong booking type, etc.) → 400. */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(
                ApiErrorResponse.of(400, "Bad Request", ex.getMessage(), request.getRequestURI())
        );
    }

    // ─── Spring MVC + JPA / Jackson exceptions → clean 4xx ───────────────

    /** Malformed JSON / wrong types in the body → 400, not 500. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        String root = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        return ResponseEntity.badRequest().body(
                ApiErrorResponse.of(400, "Bad Request",
                        "Malformed request body: " + root, request.getRequestURI())
        );
    }

    /** Missing @RequestParam → 400. */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingParam(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(
                ApiErrorResponse.of(400, "Bad Request", ex.getMessage(), request.getRequestURI())
        );
    }

    /** Wrong type in path/query (e.g. non-UUID where UUID expected) → 400. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String msg = "Invalid value '" + ex.getValue() + "' for parameter '" + ex.getName() + "'";
        return ResponseEntity.badRequest().body(
                ApiErrorResponse.of(400, "Bad Request", msg, request.getRequestURI())
        );
    }

    /** Validation on method/path parameters (service-layer @Validated) → 400. */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        String errors = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(
                ApiErrorResponse.of(400, "Validation Failed", errors, request.getRequestURI())
        );
    }

    /**
     * DB constraint violations (NOT NULL, UNIQUE, FK). These happen when
     * bean validation was bypassed or the caller sent a technically-valid
     * payload that the schema still rejects. 409 Conflict beats 500.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        String root = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        log.warn("DataIntegrityViolation at {}: {}", request.getRequestURI(), root);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ApiErrorResponse.of(409, "Data Conflict", root, request.getRequestURI())
        );
    }

    // ─── Catch-all ───────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}: {} ({})",
                request.getRequestURI(), ex.getMessage(), ex.getClass().getName(), ex);
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

    /**
     * Several services throw {@link NoSuchElementException} on lookup
     * misses (e.g. OnSiteRescueService when no NgoAssignment matches).
     * Map it to 404 so callers know the referenced resource isn't there,
     * instead of falling through to the generic 500.
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiErrorResponse> handleNoSuchElement(
            NoSuchElementException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiErrorResponse.of(404, "Not Found",
                        ex.getMessage() != null ? ex.getMessage() : "Resource not found",
                        request.getRequestURI())
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