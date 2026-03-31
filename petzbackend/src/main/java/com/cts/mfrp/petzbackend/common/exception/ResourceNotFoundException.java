package com.cts.mfrp.petzbackend.common.exception;

/**
 * Thrown when a requested resource (SOS Report, Mission, User, etc.) is not found.
 * Used across all modules.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " not found with id: " + id);
    }
}