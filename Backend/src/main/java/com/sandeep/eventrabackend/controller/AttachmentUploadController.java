package com.sandeep.eventrabackend.controller;

import com.eventra.service.SvgSanitizationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller decoupled from transaction blocks during multi-part file uploads (#16508).
 */
@RestController
@RequestMapping("/api/attachments")
public class AttachmentUploadController {

    private final AsyncUploadManager uploadManager;
    private final SvgSanitizationService svgSanitizationService;

    public AttachmentUploadController(AsyncUploadManager uploadManager, SvgSanitizationService svgSanitizationService) {
        this.uploadManager = uploadManager;
        this.svgSanitizationService = svgSanitizationService;
    }

    /**
     * File upload endpoints must run OUTSIDE active @Transactional blocks to prevent connection leaks.
     */
    @PostMapping("/upload")
    public ResponseEntity<String> uploadAttachment(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty.");
        }

        try {
            byte[] content = file.getBytes();
            String filename = file.getOriginalFilename();
            if (filename != null && filename.toLowerCase().endsWith(".svg")) {
                // Sanitize SVG uploads against stored XSS before they reach storage.
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
}
