package com.cts.mfrp.petzbackend.sosmedia.service;

import com.cts.mfrp.petzbackend.common.exception.FileValidationException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.file.upload-dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_IMAGE_TYPES =
            List.of("image/jpeg", "image/png");
    private static final List<String> ALLOWED_VIDEO_TYPES =
            List.of("video/mp4");
    /**
     * Epic 2.3.4 (Wave 2) KYC document uploads accept PDFs plus scans of
     * ID / address proof. Separate list so the main {@code storeFile}
     * contract stays unchanged for SOS / adoption-gallery callers.
     */
    private static final List<String> ALLOWED_DOCUMENT_TYPES =
            List.of("application/pdf", "image/jpeg", "image/png");

    private Path rootLocation;

    @PostConstruct
    public void init() {
        rootLocation = Paths.get(uploadDir);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileValidationException("Uploaded file is empty");
        }

        String contentType = file.getContentType();
        if (!isAllowedType(contentType)) {
            throw new FileValidationException(
                    "Invalid file type: " + contentType +
                            ". Allowed: JPEG, PNG, MP4");
        }

        String ext = getExtension(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + ext;

        try {
            Path target = rootLocation.resolve(storedName);
            Files.copy(file.getInputStream(), target,
                    StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/sos-media/" + storedName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public boolean isImage(MultipartFile file) {
        return ALLOWED_IMAGE_TYPES.contains(file.getContentType());
    }

    public boolean isVideo(MultipartFile file) {
        return ALLOWED_VIDEO_TYPES.contains(file.getContentType());
    }

    /**
     * Epic 2.3.4 — accept PDF / JPEG / PNG files for KYC documents.
     * Stored under a distinct subdirectory so they're easy to purge later
     * and so ACL rules can differ from public pet-gallery media.
     */
    public boolean isDocument(MultipartFile file) {
        return ALLOWED_DOCUMENT_TYPES.contains(file.getContentType());
    }

    /**
     * Store a KYC document. Same semantics as {@link #storeFile} but with
     * PDF allowed and a different public URL prefix. Used by Wave 2
     * {@code KycDocumentService}.
     */
    public String storeKycDocument(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("Uploaded file is empty");
        }
        if (!isDocument(file)) {
            throw new FileValidationException(
                    "Invalid KYC document type: " + file.getContentType() +
                            ". Allowed: PDF, JPEG, PNG");
        }
        String ext = getExtension(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + ext;
        try {
            Path target = rootLocation.resolve(storedName);
            Files.copy(file.getInputStream(), target,
                    StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/adoption-kyc/" + storedName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store KYC document", e);
        }
    }

    /**
     * US-4.1.4 — profile photo upload. Accepts JPEG/PNG only; 5 MB cap
     * enforced by caller (or by spring.servlet.multipart.max-file-size).
     * Stored under {@code /uploads/profile-photos/} for easy ACL / purge.
     */
    public String storeProfilePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileValidationException("Uploaded file is empty");
        }
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new FileValidationException(
                    "Invalid profile photo type: " + file.getContentType() +
                            ". Allowed: JPEG, PNG");
        }
        String ext = getExtension(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + ext;
        try {
            Path target = rootLocation.resolve(storedName);
            Files.copy(file.getInputStream(), target,
                    StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/profile-photos/" + storedName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store profile photo", e);
        }
    }

    private boolean isAllowedType(String contentType) {
        return ALLOWED_IMAGE_TYPES.contains(contentType)
                || ALLOWED_VIDEO_TYPES.contains(contentType);
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}