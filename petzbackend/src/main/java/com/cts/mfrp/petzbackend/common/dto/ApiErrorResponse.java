package com.cts.mfrp.petzbackend.common.dto;

import java.time.LocalDateTime;

/**
 * Standardized error response for ALL API endpoints across ALL modules.
 *
 * TEAMMATES: Use this for every error response. Do NOT create per-module
 * error DTOs — consistency matters for the frontend team.
 */
public record ApiErrorResponse(
        int status,
        String error,
        String message,
        String path,
        LocalDateTime timestamp
) {
    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(status, error, message, path, LocalDateTime.now());
    }
}