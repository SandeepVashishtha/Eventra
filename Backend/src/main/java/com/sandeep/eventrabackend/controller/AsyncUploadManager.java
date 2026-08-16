package com.sandeep.eventrabackend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Async Storage File Manager mapping uploads to static links (#16508).
 * Persists uploaded bytes to a local uploads directory and returns a
 * URL that the static resource handler serves back.
 */
@Component
public class AsyncUploadManager {

    private final Path uploadDir;

    public AsyncUploadManager(@Value("${eventra.upload-dir:./uploads}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir);
    }

    public String writeToStorage(String filename, byte[] bytes) {
        String safeName = sanitizeFileName(filename);
        String storedName = UUID.randomUUID() + "_" + safeName;
        try {
            Files.createDirectories(uploadDir);
            Files.write(uploadDir.resolve(storedName), bytes);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to persist uploaded file " + storedName, e);
        }
        return "/uploads/" + storedName;
    }

    private String sanitizeFileName(String filename) {
        if (filename == null || filename.isBlank()) {
            return "file";
        }
        return Paths.get(filename).getFileName().toString();
    }
}
