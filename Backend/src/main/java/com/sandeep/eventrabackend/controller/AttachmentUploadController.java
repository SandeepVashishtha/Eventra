package com.sandeep.eventrabackend.controller;

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

    public AttachmentUploadController(AsyncUploadManager uploadManager) {
        this.uploadManager = uploadManager;
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
            // Processing dynamic network streaming safely without active database transactions
            String link = uploadManager.writeToStorage(file.getOriginalFilename(), file.getBytes());
            return ResponseEntity.ok("File uploaded to: " + link);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }
}
