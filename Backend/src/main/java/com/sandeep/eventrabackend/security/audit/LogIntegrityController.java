package com.sandeep.eventrabackend.security.audit;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * REST Controller for Log Integrity Auditing.
 * Exposes endpoints to monitor, verify, and manage audit log hash-chain integrity.
 * Feature #17703
 */
@RestController
@RequestMapping("/api/audit")
public class LogIntegrityController {

    private final AuditLogManager logManager;
    private final MerkleTreeHasher merkleHasher;

    public LogIntegrityController(AuditLogManager logManager, MerkleTreeHasher merkleHasher) {
        this.logManager = logManager;
        this.merkleHasher = merkleHasher;
    }

    /**
     * GET endpoint to retrieve all block root hashes.
     * Returns a map of block IDs to their root hashes.
     *
     * @return Map of block IDs to root hashes
     */
    @GetMapping("/roots")
    public Map<String, String> getBlockRoots() {
        return logManager.getBlockRoots();
    }

    /**
     * GET endpoint to retrieve detailed information about all blocks.
     *
     * @return List of block information
     */
    @GetMapping("/blocks")
    public List<BlockInfo> getBlocks() {
        return logManager.getBlocks().values().stream()
                .map(block -> new BlockInfo(
                        block.getBlockId(),
                        block.getRootHash(),
                        block.getPreviousHash(),
                        block.getLogCount(),
                        block.getTimestamp(),
                        block.getLogs().stream()
                                .map(AuditLogManager.AuditLogEntry::getAction)
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
    }

    /**
     * DTO for block information
     */
    public static class BlockInfo {
        private final String blockId;
        private final String rootHash;
        private final String previousHash;
        private final int logCount;
        private final String timestamp;
        private final List<String> actions;

        public BlockInfo(String blockId, String rootHash, String previousHash, 
                        int logCount, String timestamp, List<String> actions) {
            this.blockId = blockId;
            this.rootHash = rootHash;
            this.previousHash = previousHash;
            this.logCount = logCount;
            this.timestamp = timestamp;
            this.actions = actions;
        }

        // Getters
        public String getBlockId() { return blockId; }
        public String getRootHash() { return rootHash; }
        public String getPreviousHash() { return previousHash; }
        public int getLogCount() { return logCount; }
        public String getTimestamp() { return timestamp; }
        public List<String> getActions() { return actions; }
    }

    /**
     * GET endpoint to retrieve the complete hash chain.
     *
     * @return List of root hashes in the chain
     */
    @GetMapping("/hash-chain")
    public List<String> getHashChain() {
        return logManager.getHashChain();
    }

    /**
     * GET endpoint to verify the integrity of all blocks.
     *
     * @return Verification result for all blocks
     */
    @GetMapping("/verify")
    public ResponseEntity<VerificationResult> verifyAllBlocks() {
        Map<String, Boolean> blockVerification = new HashMap<>();
        boolean allValid = true;

        for (Map.Entry<String, AuditLogManager.Block> entry : logManager.getBlocks().entrySet()) {
            String blockId = entry.getKey();
            AuditLogManager.Block block = entry.getValue();

            List<String> logStrings = block.getLogs().stream()
                    .map(AuditLogManager.AuditLogEntry::toString)
                    .collect(Collectors.toList());

            String computedRootHash = merkleHasher.computeRootHash(logStrings);
            boolean isValid = block.getRootHash().equals(computedRootHash);

            blockVerification.put(blockId, isValid);
            if (!isValid) {
                allValid = false;
            }
        }

        VerificationResult result = new VerificationResult(
                allValid,
                blockVerification,
                logManager.getStatistics()
        );

        return ResponseEntity.ok(result);
    }

    /**
     * POST endpoint to verify the integrity of a specific block.
     *
     * @param request Verification request containing block ID
     * @return Verification result for the specific block
     */
    @PostMapping("/verify-block")
    public ResponseEntity<BlockVerificationResult> verifyBlock(@RequestBody VerifyBlockRequest request) {
        AuditLogManager.Block block = logManager.getBlock(request.getBlockId());

        if (block == null) {
            return ResponseEntity.badRequest().body(new BlockVerificationResult(
                    false,
                    request.getBlockId(),
                    "Block not found",
                    "",
                    ""
            ));
        }

        List<String> logStrings = block.getLogs().stream()
                .map(AuditLogManager.AuditLogEntry::toString)
                .collect(Collectors.toList());

        String expectedRootHash = block.getRootHash();
        String computedRootHash = merkleHasher.computeRootHash(logStrings);
        boolean isValid = expectedRootHash.equals(computedRootHash);

        BlockVerificationResult result = new BlockVerificationResult(
                isValid,
                block.getBlockId(),
                isValid ? "Integrity verified" : "Integrity check failed",
                expectedRootHash,
                computedRootHash
        );

        return ResponseEntity.ok(result);
    }

    /**
     * DTO for verification request
     */
    public static class VerifyBlockRequest {
        private String blockId;

        public VerifyBlockRequest() {}

        public VerifyBlockRequest(String blockId) {
            this.blockId = blockId;
        }

        public String getBlockId() { return blockId; }
        public void setBlockId(String blockId) { this.blockId = blockId; }
    }

    /**
     * DTO for block verification result
     */
    public static class BlockVerificationResult {
        private final boolean isValid;
        private final String blockId;
        private final String message;
        private final String expectedRootHash;
        private final String computedRootHash;

        public BlockVerificationResult(boolean isValid, String blockId, String message,
                                      String expectedRootHash, String computedRootHash) {
            this.isValid = isValid;
            this.blockId = blockId;
            this.message = message;
            this.expectedRootHash = expectedRootHash;
            this.computedRootHash = computedRootHash;
        }

        // Getters
        public boolean isValid() { return isValid; }
        public String getBlockId() { return blockId; }
        public String getMessage() { return message; }
        public String getExpectedRootHash() { return expectedRootHash; }
        public String getComputedRootHash() { return computedRootHash; }
    }

    /**
     * DTO for overall verification result
     */
    public static class VerificationResult {
        private final boolean allValid;
        private final Map<String, Boolean> blockResults;
        private final Map<String, Object> statistics;

        public VerificationResult(boolean allValid, Map<String, Boolean> blockResults, 
                                 Map<String, Object> statistics) {
            this.allValid = allValid;
            this.blockResults = blockResults;
            this.statistics = statistics;
        }

        // Getters
        public boolean isAllValid() { return allValid; }
        public Map<String, Boolean> getBlockResults() { return blockResults; }
        public Map<String, Object> getStatistics() { return statistics; }
    }

    /**
     * GET endpoint to retrieve audit statistics.
     *
     * @return Statistics about audit logs and blocks
     */
    @GetMapping("/statistics")
    public Map<String, Object> getStatistics() {
        return logManager.getStatistics();
    }

    /**
     * GET endpoint to retrieve all audit logs.
     *
     * @return List of all log entries
     */
    @GetMapping("/logs")
    public List<LogEntryInfo> getAllLogs() {
        return logManager.getAllLogs().stream()
                .map(log -> new LogEntryInfo(
                        log.getId(),
                        log.getAction(),
                        log.getTimestamp(),
                        log.getMetadata()
                ))
                .collect(Collectors.toList());
    }

    /**
     * DTO for log entry information
     */
    public static class LogEntryInfo {
        private final String id;
        private final String action;
        private final String timestamp;
        private final Map<String, Object> metadata;

        public LogEntryInfo(String id, String action, String timestamp, Map<String, Object> metadata) {
            this.id = id;
            this.action = action;
            this.timestamp = timestamp;
            this.metadata = metadata;
        }

        // Getters
        public String getId() { return id; }
        public String getAction() { return action; }
        public String getTimestamp() { return timestamp; }
        public Map<String, Object> getMetadata() { return metadata; }
    }

    /**
     * POST endpoint to record a new audit log action.
     *
     * @param request Action recording request
     * @return Success response with recorded action info
     */
    @PostMapping("/record")
    public ResponseEntity<RecordResponse> recordAction(@RequestBody RecordActionRequest request) {
        logManager.recordAction(request.getAction(), request.getMetadata());

        RecordResponse response = new RecordResponse(
                true,
                "Action recorded successfully",
                request.getAction()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * DTO for recording an action request
     */
    public static class RecordActionRequest {
        private String action;
        private Map<String, Object> metadata;

        public RecordActionRequest() {}

        public RecordActionRequest(String action, Map<String, Object> metadata) {
            this.action = action;
            this.metadata = metadata;
        }

        // Getters and Setters
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    }

    /**
     * DTO for recording response
     */
    public static class RecordResponse {
        private final boolean success;
        private final String message;
        private final String action;

        public RecordResponse(boolean success, String message, String action) {
            this.success = success;
            this.message = message;
            this.action = action;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getAction() { return action; }
    }

    /**
     * POST endpoint to finalize current pending logs into a block.
     *
     * @return Success response
     */
    @PostMapping("/finalize")
    public ResponseEntity<FinalizeResponse> finalizeCurrentBlock() {
        logManager.finalizeCurrentBlock();

        FinalizeResponse response = new FinalizeResponse(
                true,
                "Current block finalized successfully",
                logManager.getBlockCount()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * DTO for finalize response
     */
    public static class FinalizeResponse {
        private final boolean success;
        private final String message;
        private final int blockCount;

        public FinalizeResponse(boolean success, String message, int blockCount) {
            this.success = success;
            this.message = message;
            this.blockCount = blockCount;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public int getBlockCount() { return blockCount; }
    }

    /**
     * GET endpoint to check if there are pending logs.
     *
     * @return Pending status
     */
    @GetMapping("/pending")
    public PendingStatus getPendingStatus() {
        return new PendingStatus(
                logManager.hasPendingLogs(),
                logManager.getPendingLogCount()
        );
    }

    /**
     * DTO for pending status
     */
    public static class PendingStatus {
        private final boolean hasPending;
        private final int pendingCount;

        public PendingStatus(boolean hasPending, int pendingCount) {
            this.hasPending = hasPending;
            this.pendingCount = pendingCount;
        }

        // Getters
        public boolean isHasPending() { return hasPending; }
        public int getPendingCount() { return pendingCount; }
    }

    /**
     * POST endpoint to verify hash chain integrity.
     *
     * @return Hash chain verification result
     */
    @PostMapping("/verify-chain")
    public ResponseEntity<HashChainVerificationResult> verifyHashChain() {
        List<String> hashChain = logManager.getHashChain();
        List<String> rootHashes = new ArrayList<>(logManager.getBlockRoots().values());

        boolean isValid = merkleHasher.validateHashChain(hashChain, rootHashes);

        HashChainVerificationResult result = new HashChainVerificationResult(
                isValid,
                hashChain.size(),
                rootHashes.size(),
                isValid ? "Hash chain is valid" : "Hash chain integrity check failed"
        );

        return ResponseEntity.ok(result);
    }

    /**
     * DTO for hash chain verification result
     */
    public static class HashChainVerificationResult {
        private final boolean isValid;
        private final int chainLength;
        private final int rootHashCount;
        private final String message;

        public HashChainVerificationResult(boolean isValid, int chainLength, int rootHashCount, String message) {
            this.isValid = isValid;
            this.chainLength = chainLength;
            this.rootHashCount = rootHashCount;
            this.message = message;
        }

        // Getters
        public boolean isValid() { return isValid; }
        public int getChainLength() { return chainLength; }
        public int getRootHashCount() { return rootHashCount; }
        public String getMessage() { return message; }
    }

    /**
     * POST endpoint to clear all audit data (for testing or reset).
     *
     * @return Success response
     */
    @PostMapping("/clear")
    public ResponseEntity<ClearResponse> clearAllData() {
        logManager.clear();

        ClearResponse response = new ClearResponse(
                true,
                "All audit data cleared successfully"
        );

        return ResponseEntity.ok(response);
    }

    /**
     * DTO for clear response
     */
    public static class ClearResponse {
        private final boolean success;
        private final String message;

        public ClearResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }

    /**
     * GET endpoint to retrieve the latest root hash.
     *
     * @return Latest root hash
     */
    @GetMapping("/latest-hash")
    public String getLatestRootHash() {
        return logManager.getLatestRootHash();
    }
}
