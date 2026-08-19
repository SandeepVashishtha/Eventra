package com.sandeep.eventrabackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sheets")
public class GoogleSheetsProxyController {

    private final SheetsExportService sheetsExportService;

    public GoogleSheetsProxyController(SheetsExportService sheetsExportService) {
        this.sheetsExportService = sheetsExportService;
    }

    @GetMapping("/oauth/callback")
    public ResponseEntity<String> oauthCallback(@RequestParam("code") String code) {
        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Authorization code is missing");
        }

        // Exchange auth code for tokens and export data
        boolean success = sheetsExportService.initializeAndExport(code);
        if (success) {
            return ResponseEntity.ok("Attendee list successfully synchronized with Google Sheets!");
        }
        return ResponseEntity.internalServerError().body("Failed to export attendee list");
    }
}
