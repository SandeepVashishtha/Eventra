package com.sandeep.eventrabackend.security.audit;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

/**
 * Controller mapping audit root endpoints (#17665).
 */
@RestController
@RequestMapping("/api/audit")
public class LogIntegrityController {

    private final AuditLogManager logManager;

    public LogIntegrityController(AuditLogManager logManager) {
        this.logManager = logManager;
    }

    @GetMapping("/merkle-root")
    public ResponseEntity<String> getRoot() {
        return ResponseEntity.ok(logManager.getMerkleRoot());
    }
}
