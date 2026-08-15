package com.sandeep.eventrabackend.service;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Controller mapping ticket upgrade REST endpoints (#16283).
 */
@RestController
@RequestMapping("/api/upgrades")
public class UpgradeController {

    private final UpgradeService upgradeService;

    public UpgradeController(UpgradeService upgradeService) {
        this.upgradeService = upgradeService;
    }

    @PostMapping("/ticket/{ticketId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> upgrade(@PathVariable String ticketId, @RequestParam String targetTier) {
        boolean success = upgradeService.upgradeTicket(ticketId, targetTier);
        if (success) {
            return ResponseEntity.ok("Ticket upgraded successfully to " + targetTier);
        }
        return ResponseEntity.badRequest().body("Failed to upgrade ticket.");
    }
}
