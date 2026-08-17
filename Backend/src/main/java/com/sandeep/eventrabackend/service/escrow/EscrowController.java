package com.sandeep.eventrabackend.service.escrow;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for Time-Locked Escrow Wallet API (#17694)
 * 
 * Provides endpoints for:
 * - Creating escrow transactions
 * - Confirming ticket receipt
 * - Releasing funds
 * - Claiming refunds
 * - Querying escrow status
 */
@RestController
@RequestMapping("/api/escrow")
public class EscrowController {

    private final EscrowWalletService escrowWalletService;

    public EscrowController(EscrowWalletService escrowWalletService) {
        this.escrowWalletService = escrowWalletService;
    }

    /**
     * Create a new escrow transaction
     * 
     * @param request - The create escrow request
     * @return ResponseEntity with escrow creation result
     */
    @PostMapping("/transactions")
    public ResponseEntity<?> createEscrow(@RequestBody EscrowWalletService.CreateEscrowRequest request) {
        try {
            EscrowWalletService.EscrowResponse response = escrowWalletService.createEscrow(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to create escrow: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Confirm ticket receipt by buyer
     * 
     * @param escrowId - The escrow ID
     * @param buyerAddress - The buyer's wallet address (path variable for authorization)
     * @return ResponseEntity with confirmation result
     */
    @PostMapping("/{escrowId}/confirm")
    public ResponseEntity<?> confirmTicketReceipt(
            @PathVariable Long escrowId,
            @RequestParam String buyerAddress) {
        
        try {
            EscrowWalletService.EscrowResponse response = 
                escrowWalletService.confirmTicketReceipt(escrowId, buyerAddress);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "escrowId", escrowId,
                "timestamp", java.time.Instant.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to confirm ticket receipt: " + e.getMessage(),
                "escrowId", escrowId,
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Release funds to seller
     * 
     * @param escrowId - The escrow ID
     * @param sellerAddress - The seller's wallet address (path variable for authorization)
     * @return ResponseEntity with release result
     */
    @PostMapping("/{escrowId}/release")
    public ResponseEntity<?> releaseFunds(
            @PathVariable Long escrowId,
            @RequestParam String sellerAddress) {
        
        try {
            EscrowWalletService.EscrowResponse response = 
                escrowWalletService.releaseFunds(escrowId, sellerAddress);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "escrowId", escrowId,
                "timestamp", java.time.Instant.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to release funds: " + e.getMessage(),
                "escrowId", escrowId,
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Claim refund as buyer
     * 
     * @param escrowId - The escrow ID
     * @param buyerAddress - The buyer's wallet address (path variable for authorization)
     * @return ResponseEntity with refund result
     */
    @PostMapping("/{escrowId}/refund")
    public ResponseEntity<?> claimRefund(
            @PathVariable Long escrowId,
            @RequestParam String buyerAddress) {
        
        try {
            EscrowWalletService.EscrowResponse response = 
                escrowWalletService.claimRefund(escrowId, buyerAddress);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "escrowId", escrowId,
                "timestamp", java.time.Instant.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to claim refund: " + e.getMessage(),
                "escrowId", escrowId,
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Auto-release funds after timeout (system endpoint)
     * 
     * @param escrowId - The escrow ID
     * @return ResponseEntity with auto-release result
     */
    @PostMapping("/{escrowId}/auto-release")
    public ResponseEntity<?> autoReleaseFunds(@PathVariable Long escrowId) {
        try {
            EscrowWalletService.EscrowResponse response = 
                escrowWalletService.autoReleaseAfterTimeout(escrowId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to auto-release funds: " + e.getMessage(),
                "escrowId", escrowId,
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Get details of a specific escrow
     * 
     * @param escrowId - The escrow ID
     * @return ResponseEntity with escrow details
     */
    @GetMapping("/{escrowId}")
    public ResponseEntity<?> getEscrowDetails(@PathVariable Long escrowId) {
        try {
            EscrowWalletService.EscrowTransaction escrow = 
                escrowWalletService.getEscrowDetails(escrowId);
            
            if (escrow == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(convertToResponseMap(escrow));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to get escrow details: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Get all escrows for a wallet address
     * 
     * @param walletAddress - The wallet address to filter by
     * @return ResponseEntity with list of escrows
     */
    @GetMapping("/wallet/{walletAddress}")
    public ResponseEntity<?> getEscrowsByWalletAddress(@PathVariable String walletAddress) {
        try {
            List<EscrowWalletService.EscrowTransaction> escrows = 
                escrowWalletService.getEscrowsByWalletAddress(walletAddress);
            
            List<Map<String, Object>> responseList = escrows.stream()
                .map(this::convertToResponseMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", responseList.size(),
                "escrows", responseList,
                "timestamp", java.time.Instant.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to get escrows: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Get all pending escrows
     * 
     * @return ResponseEntity with list of pending escrows
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingEscrows() {
        try {
            List<EscrowWalletService.EscrowTransaction> escrows = 
                escrowWalletService.getPendingEscrows();
            
            List<Map<String, Object>> responseList = escrows.stream()
                .map(this::convertToResponseMap)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", responseList.size(),
                "pendingEscrows", responseList,
                "timestamp", java.time.Instant.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to get pending escrows: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Check if refund can be claimed for an escrow
     * 
     * @param escrowId - The escrow ID
     * @param requesterAddress - The address requesting refund
     * @return ResponseEntity with eligibility result
     */
    @GetMapping("/{escrowId}/can-refund")
    public ResponseEntity<?> canClaimRefund(
            @PathVariable Long escrowId,
            @RequestParam String requesterAddress) {
        
        try {
            Map<String, Object> result = escrowWalletService.canClaimRefund(escrowId, requesterAddress);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to check refund eligibility: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Check if funds can be released for an escrow
     * 
     * @param escrowId - The escrow ID
     * @param requesterAddress - The address requesting release
     * @return ResponseEntity with eligibility result
     */
    @GetMapping("/{escrowId}/can-release")
    public ResponseEntity<?> canReleaseFunds(
            @PathVariable Long escrowId,
            @RequestParam String requesterAddress) {
        
        try {
            Map<String, Object> result = escrowWalletService.canReleaseFunds(escrowId, requesterAddress);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to check release eligibility: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Get service statistics
     * 
     * @return ResponseEntity with service statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStatistics() {
        try {
            Map<String, Object> stats = escrowWalletService.getServiceStatistics();
            stats.put("success", true);
            stats.put("timestamp", java.time.Instant.now().toString());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to get statistics: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Validate a wallet address
     * 
     * @param address - The wallet address to validate
     * @return ResponseEntity with validation result
     */
    @GetMapping("/validate-address")
    public ResponseEntity<?> validateAddress(@RequestParam String address) {
        try {
            boolean isValid = escrowWalletService.isValidWalletAddress(address);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "address", address,
                "valid", isValid,
                "timestamp", java.time.Instant.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "error", "Failed to validate address: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Health check endpoint
     * 
     * @return ResponseEntity with service health status
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "status", "UP",
            "service", "EscrowWalletService",
            "timestamp", java.time.Instant.now().toString()
        ));
    }

    /**
     * Convert EscrowTransaction to Map for JSON response
     * 
     * @param escrow - The escrow transaction to convert
     * @return Map representation of the escrow
     */
    private Map<String, Object> convertToResponseMap(EscrowWalletService.EscrowTransaction escrow) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", escrow.getId());
        map.put("sellerWalletAddress", escrow.getSellerWalletAddress());
        map.put("buyerWalletAddress", escrow.getBuyerWalletAddress());
        map.put("ticketId", escrow.getTicketId());
        map.put("amount", escrow.getAmount().toString());
        map.put("currency", escrow.getCurrency());
        map.put("createdAt", escrow.getCreatedAt().toString());
        map.put("timeoutAt", escrow.getTimeoutAt().toString());
        map.put("ticketConfirmed", escrow.isTicketConfirmed());
        map.put("fundsReleased", escrow.isFundsReleased());
        map.put("refunded", escrow.isRefunded());
        map.put("status", escrow.getStatus().name());
        map.put("transactionHash", escrow.getTransactionHash());
        
        if (escrow.getConfirmedAt() != null) {
            map.put("confirmedAt", escrow.getConfirmedAt().toString());
        }
        if (escrow.getReleasedAt() != null) {
            map.put("releasedAt", escrow.getReleasedAt().toString());
        }
        if (escrow.getRefundedAt() != null) {
            map.put("refundedAt", escrow.getRefundedAt().toString());
        }
        if (escrow.getMetadata() != null && !escrow.getMetadata().isEmpty()) {
            map.put("metadata", escrow.getMetadata());
        }
        
        // Calculate time remaining
        long timeRemaining = java.time.Duration.between(
            java.time.Instant.now(), 
            escrow.getTimeoutAt()
        ).toMillis();
        map.put("timeRemainingMillis", timeRemaining);
        map.put("isExpired", timeRemaining <= 0);
        
        return map;
    }
}
