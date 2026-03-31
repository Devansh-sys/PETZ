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