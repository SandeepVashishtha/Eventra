package com.sandeep.eventrabackend.security.audit;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * Controller exposing REST mapping endpoint to monitor audit log trees integrity status (#16268).
 */
@RestController
@RequestMapping("/api/audit")
public class LogIntegrityController {

    private final AuditLogManager logManager;

    public LogIntegrityController(AuditLogManager logManager) {
        this.logManager = logManager;
    }

    @GetMapping("/roots")
    public Map<String, String> getBlockRoots() {
        return logManager.getBlockRoots();
    }
}
