package com.petz.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
public class FileStorageUtil {

    @Value("${petz.upload.dir:./uploads}")
    private String uploadDir;

    public String store(MultipartFile file, String subfolder) throws IOException {
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }
        String uniqueName = UUID.randomUUID() + "_" + (originalName != null ? originalName : "file");

        Path dir = Paths.get(uploadDir, subfolder);
        Files.createDirectories(dir);

        Path filePath = dir.resolve(uniqueName);
        Files.write(filePath, file.getBytes());

        return "/uploads/" + subfolder + "/" + uniqueName;
    }

    public void delete(String fileUrl) {
        if (fileUrl == null) return;
        try {
            String relativePath = fileUrl.replace("/uploads/", "");
            Path path = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
        }
    }
}
