package com.sandeep.eventrabackend.service;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

/**
 * Controller mapping ticket purchase endpoints (#16469).
 */
@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<String> checkout(@RequestParam String tier, @RequestParam int qty) {
        boolean success = purchaseService.purchaseTicket(tier, qty);
        if (success) {
            return ResponseEntity.ok("Purchase successful!");
        }
        return ResponseEntity.status(409).body("Exceeded event capacity or tier limits.");
    }
}
