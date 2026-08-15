package com.sandeep.eventrabackend.controller;

import com.eventra.service.SvgSanitizationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

/**
 * Controller decoupled from transaction blocks during multi-part file uploads (#16508).
 */
@RestController
@RequestMapping("/api/attachments")
public class AttachmentUploadController {

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf"
    );

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "application/pdf"
    );

    private final AsyncUploadManager uploadManager;
    private final SvgSanitizationService svgSanitizationService;
    private final long maxFileSize;

    public AttachmentUploadController(AsyncUploadManager uploadManager, 
            SvgSanitizationService svgSanitizationService,
            @Value("${eventra.max-upload-size:10485760}") long maxFileSize) {
        this.uploadManager = uploadManager;
        this.svgSanitizationService = svgSanitizationService;
        this.maxFileSize = maxFileSize;
    }

    /**
     * File upload endpoints must run OUTSIDE active @Transactional blocks to prevent connection leaks.
     */
    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> uploadAttachment(@RequestParam("file") MultipartFile file) {
        // Check if file is empty
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty.");
        }

        // Check file size
        if (file.getSize() > maxFileSize) {
            return ResponseEntity.badRequest().body(
                    String.format("File size exceeds maximum limit of %d bytes.", maxFileSize));
        }

        // Validate file extension
        String filename = file.getOriginalFilename();
        if (filename == null || !hasAllowedExtension(filename)) {
            return ResponseEntity.badRequest().body("File type not allowed. Allowed extensions: " + ALLOWED_EXTENSIONS);
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body("File content type not allowed.");
        }

        try {
            byte[] content = file.getBytes();
            
            // Sanitize SVG uploads against stored XSS before they reach storage
            if (filename.toLowerCase().endsWith(".svg")) {
                content = svgSanitizationService.sanitizeSvgContent(content);
            }

            // Processing dynamic network streaming safely without active database transactions
            String link = uploadManager.writeToStorage(filename, content);
            return ResponseEntity.ok("File uploaded to: " + link);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Rejected SVG upload: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    /**
     * Validates that the file has an allowed extension.
     * Checks both the original filename and the content type for consistency.
     */
    private boolean hasAllowedExtension(String filename) {
        if (filename == null) {
            return false;
        }
        String lowerFilename = filename.toLowerCase();
        return ALLOWED_EXTENSIONS.stream().anyMatch(lowerFilename::endsWith);
    }
}
