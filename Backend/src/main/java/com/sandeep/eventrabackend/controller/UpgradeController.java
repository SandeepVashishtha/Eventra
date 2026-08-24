package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.service.UpgradeService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

/**
 * Controller mapping ticket upgrade and add-on allocation REST endpoints (#16283, #19087).
 */
@RestController
@RequestMapping("/api/upgrades")
public class UpgradeController {

    private final UpgradeService upgradeService;

    public UpgradeController(UpgradeService upgradeService) {
        this.upgradeService = upgradeService;
    }

    @PostMapping("/ticket/{ticketId}")
    public ResponseEntity<String> upgrade(@PathVariable String ticketId, @RequestParam String targetTier) {
        boolean success = upgradeService.upgradeTicket(ticketId, targetTier);
        if (success) {
            return ResponseEntity.ok("Ticket upgraded successfully to " + targetTier);
        }
        return ResponseEntity.badRequest().body("Failed to upgrade ticket.");
    }

    @PostMapping("/addon/{addonId}/allocate")
    public ResponseEntity<String> allocateAddon(@PathVariable String addonId) {
        boolean success = upgradeService.allocateAddon(addonId);
        if (success) {
            return ResponseEntity.ok("Add-on allocated successfully.");
        }
        return ResponseEntity.badRequest().body("Add-on allocation failed or quota depleted.");
    }

    @GetMapping("/addon/{addonId}/remaining")
    public ResponseEntity<Integer> getRemainingQuota(@PathVariable String addonId) {
        int remaining = upgradeService.getRemainingAddonQuota(addonId);
        return ResponseEntity.ok(remaining);
    }
}
