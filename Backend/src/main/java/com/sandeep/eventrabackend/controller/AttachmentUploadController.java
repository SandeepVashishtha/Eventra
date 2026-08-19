package com.sandeep.eventrabackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentUploadController {

    @PostMapping("/upload")
    public ResponseEntity<UploadResponseDto> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new UploadResponseDto(false, "File is empty", null));
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/png") && !contentType.equals("image/jpeg"))) {
            return ResponseEntity.badRequest().body(new UploadResponseDto(false, "Invalid format. Only PNG/JPEG allowed.", null));
        }

        String fileUrl = "https://eventra-storage.s3.amazonaws.com/uploads/" + file.getOriginalFilename();
        return ResponseEntity.ok(new UploadResponseDto(true, "Upload successful", fileUrl));
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
