package com.sandeep.eventrabackend.service.escrow;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Escrow Wallet Service for Time-Locked P2P Ticket Resales (#17694)
 * 
 * Implements secure escrow functionality for peer-to-peer ticket transfers:
 * - Atomic ticket-money swaps
 * - Time-locked refund policies
 * - Automated fund release after ticket verification
 * - Fraud prevention mechanisms
 */
@Service
public class EscrowWalletService {

    /**
     * Escrow status enumeration
     */
    public enum EscrowStatus {
        PENDING,
        TICKET_CONFIRMED,
        FUNDS_RELEASED,
        REFUNDED,
        EXPIRED
    }

    /**
     * Escrow transaction entity
     */
    public static class EscrowTransaction {
        private final Long id;
        private final String sellerWalletAddress;
        private final String buyerWalletAddress;
        private final Long ticketId;
        private final BigDecimal amount;
        private final String currency;
        private final Instant createdAt;
        private final Instant timeoutAt;
        private boolean ticketConfirmed;
        private boolean fundsReleased;
        private boolean refunded;
        private EscrowStatus status;
        private String transactionHash;
        private Instant confirmedAt;
        private Instant releasedAt;
        private Instant refundedAt;
        private String metadata;

        public EscrowTransaction(Long id, String sellerWalletAddress, String buyerWalletAddress,
                                  Long ticketId, BigDecimal amount, String currency,
                                  Instant createdAt, Instant timeoutAt) {
            this.id = id;
            this.sellerWalletAddress = sellerWalletAddress;
            this.buyerWalletAddress = buyerWalletAddress;
            this.ticketId = ticketId;
            this.amount = amount;
            this.currency = currency != null ? currency : "ETH";
            this.createdAt = createdAt;
            this.timeoutAt = timeoutAt;
            this.ticketConfirmed = false;
            this.fundsReleased = false;
            this.refunded = false;
            this.status = EscrowStatus.PENDING;
            this.transactionHash = generateTransactionHash();
            this.confirmedAt = null;
            this.releasedAt = null;
            this.refundedAt = null;
            this.metadata = "";
        }

        // Getters
        public Long getId() { return id; }
        public String getSellerWalletAddress() { return sellerWalletAddress; }
        public String getBuyerWalletAddress() { return buyerWalletAddress; }
        public Long getTicketId() { return ticketId; }
        public BigDecimal getAmount() { return amount; }
        public String getCurrency() { return currency; }
        public Instant getCreatedAt() { return createdAt; }
        public Instant getTimeoutAt() { return timeoutAt; }
        public boolean isTicketConfirmed() { return ticketConfirmed; }
        public boolean isFundsReleased() { return fundsReleased; }
        public boolean isRefunded() { return refunded; }
        public EscrowStatus getStatus() { return status; }
        public String getTransactionHash() { return transactionHash; }
        public Instant getConfirmedAt() { return confirmedAt; }
        public Instant getReleasedAt() { return releasedAt; }
        public Instant getRefundedAt() { return refundedAt; }
        public String getMetadata() { return metadata; }

        // Setters for mutable fields
        public void setTicketConfirmed(boolean ticketConfirmed) { 
            this.ticketConfirmed = ticketConfirmed; 
        }
        public void setFundsReleased(boolean fundsReleased) { 
            this.fundsReleased = fundsReleased; 
        }
        public void setRefunded(boolean refunded) { 
            this.refunded = refunded; 
        }
        public void setStatus(EscrowStatus status) { 
            this.status = status; 
        }
        public void setConfirmedAt(Instant confirmedAt) { 
            this.confirmedAt = confirmedAt; 
        }
        public void setReleasedAt(Instant releasedAt) { 
            this.releasedAt = releasedAt; 
        }
        public void setRefundedAt(Instant refundedAt) { 
            this.refundedAt = refundedAt; 
        }
        public void setMetadata(String metadata) { 
            this.metadata = metadata; 
        }

        private static String generateTransactionHash() {
            return "0x" + UUID.randomUUID().toString().replace("-", "").substring(0, 64);
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            EscrowTransaction that = (EscrowTransaction) o;
            return Objects.equals(id, that.id);
        }

        @Override
        public int hashCode() {
            return Objects.hash(id);
        }
    }

    /**
     * Request DTO for creating an escrow
     */
    public static class CreateEscrowRequest {
        private String sellerWalletAddress;
        private String buyerWalletAddress;
        private Long ticketId;
        private BigDecimal amount;
        private String currency = "ETH";
        private Integer timeoutMinutes = 60;
        private String metadata;

        // Getters and Setters
        public String getSellerWalletAddress() { return sellerWalletAddress; }
        public void setSellerWalletAddress(String sellerWalletAddress) { 
            this.sellerWalletAddress = sellerWalletAddress; 
        }
        public String getBuyerWalletAddress() { return buyerWalletAddress; }
        public void setBuyerWalletAddress(String buyerWalletAddress) { 
            this.buyerWalletAddress = buyerWalletAddress; 
        }
        public Long getTicketId() { return ticketId; }
        public void setTicketId(Long ticketId) { 
            this.ticketId = ticketId; 
        }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { 
            this.amount = amount; 
        }
        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { 
            this.currency = currency; 
        }
        public Integer getTimeoutMinutes() { return timeoutMinutes; }
        public void setTimeoutMinutes(Integer timeoutMinutes) { 
            this.timeoutMinutes = timeoutMinutes; 
        }
        public String getMetadata() { return metadata; }
        public void setMetadata(String metadata) { 
            this.metadata = metadata; 
        }
    }

    /**
     * Response DTO for escrow operations
     */
    public static class EscrowResponse {
        private boolean success;
        private Long escrowId;
        private String transactionHash;
        private EscrowStatus status;
        private String message;
        private Instant timestamp;
        private Map<String, Object> data = new HashMap<>();

        public EscrowResponse() {}

        public EscrowResponse(boolean success, Long escrowId, String transactionHash,
                              EscrowStatus status, String message) {
            this.success = success;
            this.escrowId = escrowId;
            this.transactionHash = transactionHash;
            this.status = status;
            this.message = message;
            this.timestamp = Instant.now();
        }

        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public Long getEscrowId() { return escrowId; }
        public void setEscrowId(Long escrowId) { this.escrowId = escrowId; }
        public String getTransactionHash() { return transactionHash; }
        public void setTransactionHash(String transactionHash) { 
            this.transactionHash = transactionHash; 
        }
        public EscrowStatus getStatus() { return status; }
        public void setStatus(EscrowStatus status) { this.status = status; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
        public Map<String, Object> getData() { return data; }
        public void setData(Map<String, Object> data) { this.data = data; }
        public void addData(String key, Object value) { this.data.put(key, value); }
    }

    // In-memory storage for escrow transactions (for demo/prototype)
    // In production, this would be replaced with database repositories
    private final Map<Long, EscrowTransaction> escrowStore = new ConcurrentHashMap<>();
    private final Lock escrowLock = new ReentrantLock();
    private Long nextEscrowId = 1L;

    // Default timeout configuration
    private static final int MIN_TIMEOUT_MINUTES = 5;
    private static final int MAX_TIMEOUT_MINUTES = 1440; // 24 hours
    private static final int DEFAULT_TIMEOUT_MINUTES = 60;

    /**
     * Create a new escrow transaction for P2P ticket resale
     * 
     * @param request - The create escrow request
     * @return EscrowResponse with transaction details
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public EscrowResponse createEscrow(CreateEscrowRequest request) {
        validateCreateEscrowRequest(request);

        escrowLock.lock();
        try {
            Long escrowId = nextEscrowId++;
            Instant now = Instant.now();
            Instant timeoutAt = now.plusSeconds(request.getTimeoutMinutes() * 60L);

            EscrowTransaction escrow = new EscrowTransaction(
                escrowId,
                request.getSellerWalletAddress().toLowerCase(),
                request.getBuyerWalletAddress().toLowerCase(),
                request.getTicketId(),
                request.getAmount(),
                request.getCurrency(),
                now,
                timeoutAt
            );

            if (request.getMetadata() != null) {
                escrow.setMetadata(request.getMetadata());
            }

            escrowStore.put(escrowId, escrow);

            return new EscrowResponse(
                true,
                escrowId,
                escrow.getTransactionHash(),
                EscrowStatus.PENDING,
                "Escrow created successfully. Buyer funds are now locked."
            );
        } finally {
            escrowLock.unlock();
        }
    }

    /**
     * Confirm that the buyer has received the valid ticket
     * This triggers the time-lock countdown
     * 
     * @param escrowId - The escrow ID
     * @param buyerAddress - The buyer's wallet address (for authorization)
     * @return EscrowResponse with confirmation details
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public EscrowResponse confirmTicketReceipt(Long escrowId, String buyerAddress) {
        EscrowTransaction escrow = findEscrowById(escrowId);
        validateConfirmTicketReceipt(escrow, buyerAddress);

        escrowLock.lock();
        try {
            escrow.setTicketConfirmed(true);
            escrow.setStatus(EscrowStatus.TICKET_CONFIRMED);
            escrow.setConfirmedAt(Instant.now());

            return new EscrowResponse(
                true,
                escrowId,
                escrow.getTransactionHash(),
                EscrowStatus.TICKET_CONFIRMED,
                "Ticket receipt confirmed. Funds will be released after verification or timeout."
            );
        } finally {
            escrowLock.unlock();
        }
    }

    /**
     * Release funds to the seller after ticket verification
     * 
     * @param escrowId - The escrow ID
     * @param sellerAddress - The seller's wallet address (for authorization)
     * @return EscrowResponse with release details
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public EscrowResponse releaseFunds(Long escrowId, String sellerAddress) {
        EscrowTransaction escrow = findEscrowById(escrowId);
        validateReleaseFunds(escrow, sellerAddress);

        escrowLock.lock();
        try {
            escrow.setFundsReleased(true);
            escrow.setStatus(EscrowStatus.FUNDS_RELEASED);
            escrow.setReleasedAt(Instant.now());

            EscrowResponse response = new EscrowResponse(
                true,
                escrowId,
                escrow.getTransactionHash(),
                EscrowStatus.FUNDS_RELEASED,
                "Funds released to seller successfully."
            );
            response.addData("amount", escrow.getAmount());
            response.addData("currency", escrow.getCurrency());
            response.addData("to", escrow.getSellerWalletAddress());
            response.addData("releasedAt", escrow.getReleasedAt());

            return response;
        } finally {
            escrowLock.unlock();
        }
    }

    /**
     * Allow buyer to claim refund if ticket was not received or is invalid
     * Can only be called before timeout expires
     * 
     * @param escrowId - The escrow ID
     * @param buyerAddress - The buyer's wallet address (for authorization)
     * @return EscrowResponse with refund details
     * @throws IllegalArgumentException if validation fails
     */
    @Transactional
    public EscrowResponse claimRefund(Long escrowId, String buyerAddress) {
        EscrowTransaction escrow = findEscrowById(escrowId);
        validateClaimRefund(escrow, buyerAddress);

        escrowLock.lock();
        try {
            escrow.setRefunded(true);
            escrow.setStatus(EscrowStatus.REFUNDED);
            escrow.setRefundedAt(Instant.now());

            EscrowResponse response = new EscrowResponse(
                true,
                escrowId,
                escrow.getTransactionHash(),
                EscrowStatus.REFUNDED,
                "Refund claimed successfully. Funds returned to buyer."
            );
            response.addData("amount", escrow.getAmount());
            response.addData("currency", escrow.getCurrency());
            response.addData("to", escrow.getBuyerWalletAddress());
            response.addData("refundedAt", escrow.getRefundedAt());

            return response;
        } finally {
            escrowLock.unlock();
        }
    }

    /**
     * Automatically release funds after timeout if ticket was confirmed
     * This is called by the system after the timeout period
     * 
     * @param escrowId - The escrow ID
     * @return EscrowResponse with auto-release details
     */
    @Transactional
    public EscrowResponse autoReleaseAfterTimeout(Long escrowId) {
        EscrowTransaction escrow = findEscrowById(escrowId);

        if (escrow == null) {
            return new EscrowResponse(false, null, null, null, "Escrow not found");
        }

        if (escrow.getStatus() != EscrowStatus.TICKET_CONFIRMED) {
            return new EscrowResponse(
                false, 
                escrowId, 
                null, 
                escrow.getStatus(),
                "Escrow not ready for auto-release. Status: " + escrow.getStatus()
            );
        }

        if (Instant.now().isBefore(escrow.getTimeoutAt())) {
            return new EscrowResponse(
                false,
                escrowId,
                null,
                escrow.getStatus(),
                "Timeout not yet reached"
            );
        }

        if (escrow.isFundsReleased()) {
            return new EscrowResponse(
                false,
                escrowId,
                null,
                escrow.getStatus(),
                "Funds already released"
            );
        }

        escrowLock.lock();
        try {
            escrow.setFundsReleased(true);
            escrow.setStatus(EscrowStatus.FUNDS_RELEASED);
            escrow.setReleasedAt(Instant.now());

            EscrowResponse response = new EscrowResponse(
                true,
                escrowId,
                escrow.getTransactionHash(),
                EscrowStatus.FUNDS_RELEASED,
                "Auto-release: Funds released to seller after timeout."
            );
            response.addData("amount", escrow.getAmount());
            response.addData("currency", escrow.getCurrency());
            response.addData("to", escrow.getSellerWalletAddress());
            response.addData("releasedAt", escrow.getReleasedAt());

            return response;
        } finally {
            escrowLock.unlock();
        }
    }

    /**
     * Get details of a specific escrow transaction
     * 
     * @param escrowId - The escrow ID
     * @return EscrowTransaction or null if not found
     */
    @Transactional(readOnly = true)
    public EscrowTransaction getEscrowDetails(Long escrowId) {
        return escrowStore.get(escrowId);
    }

    /**
     * Get all escrows for a specific user (buyer or seller)
     * 
     * @param walletAddress - The wallet address to filter by
     * @return List of escrow transactions
     */
    @Transactional(readOnly = true)
    public List<EscrowTransaction> getEscrowsByWalletAddress(String walletAddress) {
        String addressLower = walletAddress.toLowerCase();
        List<EscrowTransaction> result = new ArrayList<>();

        for (EscrowTransaction escrow : escrowStore.values()) {
            if (escrow.getSellerWalletAddress().equalsIgnoreCase(addressLower) ||
                escrow.getBuyerWalletAddress().equalsIgnoreCase(addressLower)) {
                result.add(escrow);
            }
        }

        return result;
    }

    /**
     * Get all pending escrows that need attention
     * 
     * @return List of pending escrow transactions
     */
    @Transactional(readOnly = true)
    public List<EscrowTransaction> getPendingEscrows() {
        List<EscrowTransaction> result = new ArrayList<>();

        for (EscrowTransaction escrow : escrowStore.values()) {
            if (escrow.getStatus() == EscrowStatus.PENDING && 
                Instant.now().isBefore(escrow.getTimeoutAt())) {
                result.add(escrow);
            }
        }

        return result;
    }

    /**
     * Get all expired escrows that can be auto-processed
     * 
     * @return List of expired escrow transactions
     */
    @Transactional(readOnly = true)
    public List<EscrowTransaction> getExpiredEscrows() {
        List<EscrowTransaction> result = new ArrayList<>();

        for (EscrowTransaction escrow : escrowStore.values()) {
            if (escrow.getStatus() == EscrowStatus.TICKET_CONFIRMED &&
                Instant.now().isAfter(escrow.getTimeoutAt()) &&
                !escrow.isFundsReleased()) {
                result.add(escrow);
            }
        }

        return result;
    }

    /**
     * Check if an escrow can be cancelled (refunded)
     * 
     * @param escrowId - The escrow ID
     * @param requesterAddress - The address requesting cancellation
     * @return Map with eligibility information
     */
    @Transactional(readOnly = true)
    public Map<String, Object> canClaimRefund(Long escrowId, String requesterAddress) {
        EscrowTransaction escrow = findEscrowById(escrowId);
        Map<String, Object> result = new HashMap<>();

        if (escrow == null) {
            result.put("eligible", false);
            result.put("reason", "Escrow not found");
            return result;
        }

        if (!escrow.getBuyerWalletAddress().equalsIgnoreCase(requesterAddress)) {
            result.put("eligible", false);
            result.put("reason", "Only buyer can claim refund");
            return result;
        }

        if (escrow.getStatus() != EscrowStatus.PENDING) {
            result.put("eligible", false);
            result.put("reason", "Escrow status is " + escrow.getStatus());
            return result;
        }

        if (Instant.now().isAfter(escrow.getTimeoutAt())) {
            result.put("eligible", false);
            result.put("reason", "Timeout expired");
            return result;
        }

        result.put("eligible", true);
        result.put("reason", "Eligible for refund");
        return result;
    }

    /**
     * Check if funds can be released for an escrow
     * 
     * @param escrowId - The escrow ID
     * @param requesterAddress - The address requesting release
     * @return Map with eligibility information
     */
    @Transactional(readOnly = true)
    public Map<String, Object> canReleaseFunds(Long escrowId, String requesterAddress) {
        EscrowTransaction escrow = findEscrowById(escrowId);
        Map<String, Object> result = new HashMap<>();

        if (escrow == null) {
            result.put("eligible", false);
            result.put("reason", "Escrow not found");
            return result;
        }

        if (!escrow.getSellerWalletAddress().equalsIgnoreCase(requesterAddress)) {
            result.put("eligible", false);
            result.put("reason", "Only seller can release funds");
            return result;
        }

        if (escrow.getStatus() != EscrowStatus.TICKET_CONFIRMED) {
            result.put("eligible", false);
            result.put("reason", "Ticket not confirmed. Status: " + escrow.getStatus());
            return result;
        }

        if (escrow.isFundsReleased()) {
            result.put("eligible", false);
            result.put("reason", "Funds already released");
            return result;
        }

        result.put("eligible", true);
        result.put("reason", "Eligible for fund release");
        return result;
    }

    /**
     * Validate wallet address format
     * 
     * @param address - The wallet address to validate
     * @return true if valid Ethereum address format
     */
    public boolean isValidWalletAddress(String address) {
        if (address == null || address.isEmpty()) {
            return false;
        }
        // Simple Ethereum address format validation
        return address.matches("^0x[0-9a-fA-F]{40}$");
    }

    /**
     * Validate create escrow request parameters
     * 
     * @param request - The request to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateCreateEscrowRequest(CreateEscrowRequest request) {
        List<String> errors = new ArrayList<>();

        if (request.getSellerWalletAddress() == null || 
            !isValidWalletAddress(request.getSellerWalletAddress())) {
            errors.add("Invalid seller wallet address");
        }

        if (request.getBuyerWalletAddress() == null || 
            !isValidWalletAddress(request.getBuyerWalletAddress())) {
            errors.add("Invalid buyer wallet address");
        }

        if (request.getSellerWalletAddress() != null && request.getBuyerWalletAddress() != null &&
            request.getSellerWalletAddress().equalsIgnoreCase(request.getBuyerWalletAddress())) {
            errors.add("Seller and buyer cannot be the same address");
        }

        if (request.getTicketId() == null || request.getTicketId() <= 0) {
            errors.add("Ticket ID must be a positive number");
        }

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            errors.add("Amount must be positive");
        }

        int timeout = request.getTimeoutMinutes() != null ? request.getTimeoutMinutes() : DEFAULT_TIMEOUT_MINUTES;
        if (timeout < MIN_TIMEOUT_MINUTES || timeout > MAX_TIMEOUT_MINUTES) {
            errors.add("Timeout must be between " + MIN_TIMEOUT_MINUTES + " and " + MAX_TIMEOUT_MINUTES + " minutes");
        }

        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(String.join("; ", errors));
        }
    }

    /**
     * Validate confirm ticket receipt request
     * 
     * @param escrow - The escrow to validate
     * @param buyerAddress - The buyer address to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateConfirmTicketReceipt(EscrowTransaction escrow, String buyerAddress) {
        if (escrow == null) {
            throw new IllegalArgumentException("Escrow not found");
        }

        if (!escrow.getBuyerWalletAddress().equalsIgnoreCase(buyerAddress)) {
            throw new IllegalArgumentException("Only the buyer can confirm ticket receipt");
        }

        if (escrow.getStatus() != EscrowStatus.PENDING) {
            throw new IllegalArgumentException("Escrow is not in PENDING state: " + escrow.getStatus());
        }
    }

    /**
     * Validate release funds request
     * 
     * @param escrow - The escrow to validate
     * @param sellerAddress - The seller address to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateReleaseFunds(EscrowTransaction escrow, String sellerAddress) {
        if (escrow == null) {
            throw new IllegalArgumentException("Escrow not found");
        }

        if (!escrow.getSellerWalletAddress().equalsIgnoreCase(sellerAddress)) {
            throw new IllegalArgumentException("Only the seller can release funds");
        }

        if (escrow.getStatus() != EscrowStatus.TICKET_CONFIRMED) {
            throw new IllegalArgumentException("Escrow must have ticket confirmed first. Current: " + escrow.getStatus());
        }

        if (escrow.isFundsReleased()) {
            throw new IllegalArgumentException("Funds already released for this escrow");
        }
    }

    /**
     * Validate claim refund request
     * 
     * @param escrow - The escrow to validate
     * @param buyerAddress - The buyer address to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateClaimRefund(EscrowTransaction escrow, String buyerAddress) {
        if (escrow == null) {
            throw new IllegalArgumentException("Escrow not found");
        }

        if (!escrow.getBuyerWalletAddress().equalsIgnoreCase(buyerAddress)) {
            throw new IllegalArgumentException("Only the buyer can claim refund");
        }

        if (escrow.getStatus() != EscrowStatus.PENDING) {
            throw new IllegalArgumentException("Cannot claim refund. Current status: " + escrow.getStatus());
        }

        if (Instant.now().isAfter(escrow.getTimeoutAt())) {
            throw new IllegalArgumentException("Timeout expired. Refund period has ended.");
        }
    }

    /**
     * Find escrow by ID
     * 
     * @param escrowId - The escrow ID
     * @return The escrow or null if not found
     */
    private EscrowTransaction findEscrowById(Long escrowId) {
        if (escrowId == null) {
            return null;
        }
        EscrowTransaction escrow = escrowStore.get(escrowId);
        if (escrow == null) {
            throw new IllegalArgumentException("Escrow not found: " + escrowId);
        }
        return escrow;
    }

    /**
     * Clean up completed escrows (for memory management)
     * In production with database persistence, this would use proper cleanup queries
     * 
     * @param maxAgeHours - Maximum age in hours for completed escrows
     */
    public void cleanupCompletedEscrows(int maxAgeHours) {
        Instant cutoff = Instant.now().minusSeconds(maxAgeHours * 3600L);
        List<Long> toRemove = new ArrayList<>();

        for (Map.Entry<Long, EscrowTransaction> entry : escrowStore.entrySet()) {
            EscrowTransaction escrow = entry.getValue();
            if ((escrow.isFundsReleased() || escrow.isRefunded()) &&
                escrow.getReleasedAt() != null &&
                escrow.getReleasedAt().isBefore(cutoff)) {
                toRemove.add(entry.getKey());
            }
        }

        toRemove.forEach(escrowStore::remove);
    }

    /**
     * Get statistics for the escrow service
     * 
     * @return Map with service statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getServiceStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalEscrows = escrowStore.size();
        long pendingCount = escrowStore.values().stream()
            .filter(e -> e.getStatus() == EscrowStatus.PENDING)
            .count();
        long confirmedCount = escrowStore.values().stream()
            .filter(e -> e.getStatus() == EscrowStatus.TICKET_CONFIRMED)
            .count();
        long releasedCount = escrowStore.values().stream()
            .filter(e -> e.getStatus() == EscrowStatus.FUNDS_RELEASED)
            .count();
        long refundedCount = escrowStore.values().stream()
            .filter(e -> e.getStatus() == EscrowStatus.REFUNDED)
            .count();

        stats.put("totalEscrows", totalEscrows);
        stats.put("pendingCount", pendingCount);
        stats.put("confirmedCount", confirmedCount);
        stats.put("releasedCount", releasedCount);
        stats.put("refundedCount", refundedCount);
        stats.put("activeEscrows", pendingCount + confirmedCount);
        stats.put("completedEscrows", releasedCount + refundedCount);

        return stats;
    }
}
