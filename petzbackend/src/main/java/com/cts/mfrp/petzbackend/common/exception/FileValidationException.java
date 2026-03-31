package com.cts.mfrp.petzbackend.common.exception;

/**
 * Thrown when file upload validation fails.
 * e.g. wrong format, exceeds size limit, too many files.
 */
public class FileValidationException extends RuntimeException {

    public FileValidationException(String message) {
        super(message);
    }
}