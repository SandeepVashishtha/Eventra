package com.sandeep.eventrabackend.security.audit;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * Audit Log Manager for Offline-First Sync Log Auditing with Cryptographic Hash-Chains.
 * Groups audit logs into transaction blocks and generates root hashes using Merkle Tree.
 * Feature #17703
 */
@Service
public class AuditLogManager {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogManager.class);
    private static final int BLOCK_SIZE = 4;

    private final MerkleTreeHasher hasher;
    private final List<AuditLogEntry> currentBlockLogs = new CopyOnWriteArrayList<>();
    private final Map<String, Block> blocks = new LinkedHashMap<>();
    private final List<String> hashChain = new CopyOnWriteArrayList<>();

    /**
     * Represents a single audit log entry
     */
    public static class AuditLogEntry {
        private final String action;
        private final String timestamp;
        private final Map<String, Object> metadata;
        private final String id;

        public AuditLogEntry(String action, Map<String, Object> metadata) {
            this.action = action;
            this.timestamp = new Date().toString();
            this.metadata = metadata != null ? new HashMap<>(metadata) : new HashMap<>();
            this.id = generateId();
        }

        private static String generateId() {
            return "log_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
        }

        // Getters
        public String getAction() { return action; }
        public String getTimestamp() { return timestamp; }
        public Map<String, Object> getMetadata() { return Collections.unmodifiableMap(metadata); }
        public String getId() { return id; }

        @Override
        public String toString() {
            return String.format("AuditLogEntry{action='%s', timestamp='%s', id='%s'}", action, timestamp, id);
        }
    }

    /**
     * Represents a block of audit logs with its Merkle root hash
     */
    public static class Block {
        private final String blockId;
        private final String rootHash;
        private final String previousHash;
        private final List<AuditLogEntry> logs;
        private final String timestamp;

        public Block(String blockId, String rootHash, String previousHash, List<AuditLogEntry> logs) {
            this.blockId = blockId;
            this.rootHash = rootHash;
            this.previousHash = previousHash;
            this.logs = Collections.unmodifiableList(new ArrayList<>(logs));
            this.timestamp = new Date().toString();
        }

        // Getters
        public String getBlockId() { return blockId; }
        public String getRootHash() { return rootHash; }
        public String getPreviousHash() { return previousHash; }
        public List<AuditLogEntry> getLogs() { return logs; }
        public String getTimestamp() { return timestamp; }
        public int getLogCount() { return logs.size(); }

        @Override
        public String toString() {
            return String.format("Block{blockId='%s', rootHash='%s', logCount=%d}", blockId, rootHash, logs.size());
        }
    }

    public AuditLogManager(MerkleTreeHasher hasher) {
        this.hasher = hasher;
        logger.info("AuditLogManager initialized with MerkleTreeHasher");
    }

    /**
     * Records an audit log action. When the block size threshold is reached,
     * a new block is created with a Merkle root hash.
     *
     * @param action The action to record
     */
    public synchronized void recordAction(String action) {
        recordAction(action, null);
    }

    /**
     * Records an audit log action with metadata. When the block size threshold is reached,
     * a new block is created with a Merkle root hash and added to the hash chain.
     *
     * @param action The action to record
     * @param metadata Optional metadata to include with the action
     */
    public synchronized void recordAction(String action, Map<String, Object> metadata) {
        AuditLogEntry entry = new AuditLogEntry(action, metadata);
        currentBlockLogs.add(entry);
        
        logger.debug("Recorded audit action: {} - {}", entry.getAction(), entry.getId());

        if (currentBlockLogs.size() >= BLOCK_SIZE) {
            createBlock();
        }
    }

    /**
     * Creates a new block from the current log entries and adds it to the hash chain.
     */
    private synchronized void createBlock() {
        if (currentBlockLogs.isEmpty()) {
            return;
        }

        String blockId = generateBlockId();
        List<String> logStrings = currentBlockLogs.stream()
                .map(AuditLogEntry::toString)
                .collect(Collectors.toList());

        String rootHash = hasher.computeRootHash(logStrings);
        String previousHash = hashChain.isEmpty() ? "" : hashChain.get(hashChain.size() - 1);

        // Create the block
        Block block = new Block(blockId, rootHash, previousHash, new ArrayList<>(currentBlockLogs));
        blocks.put(blockId, block);
        hashChain.add(rootHash);

        logger.info("Created new audit block: {} with {} logs, rootHash: {}", 
                blockId, currentBlockLogs.size(), rootHash);

        // Clear current logs
        currentBlockLogs.clear();
    }

    /**
     * Generates a unique block ID
     */
    private static String generateBlockId() {
        return "block_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    /**
     * Finalizes any pending logs into a block. Useful for ensuring all logs are
     * captured when shutting down or before verification.
     */
    public synchronized void finalizeCurrentBlock() {
        if (!currentBlockLogs.isEmpty()) {
            createBlock();
        }
    }

    /**
     * Gets all finalized blocks with their root hashes.
     */
    public Map<String, Block> getBlocks() {
        return Collections.unmodifiableMap(blocks);
    }

    /**
     * Gets the complete hash chain (list of root hashes in order).
     */
    public List<String> getHashChain() {
        return Collections.unmodifiableList(hashChain);
    }

    /**
     * Gets the current pending logs that haven't been finalized into a block.
     */
    public List<AuditLogEntry> getCurrentLogs() {
        return Collections.unmodifiableList(currentBlockLogs);
    }

    /**
     * Gets all logs across all blocks and pending logs.
     */
    public List<AuditLogEntry> getAllLogs() {
        List<AuditLogEntry> allLogs = new ArrayList<>();
        blocks.values().forEach(block -> allLogs.addAll(block.getLogs()));
        allLogs.addAll(currentBlockLogs);
        return Collections.unmodifiableList(allLogs);
    }

    /**
     * Gets the block roots as a simple map (for backward compatibility).
     */
    public Map<String, String> getBlockRoots() {
        return blocks.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().getRootHash()
                ));
    }

    /**
     * Gets the root hash of the most recent block.
     */
    public String getLatestRootHash() {
        if (hashChain.isEmpty()) {
            return "";
        }
        return hashChain.get(hashChain.size() - 1);
    }

    /**
     * Gets statistics about the audit logs.
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        int totalLogs = blocks.values().stream()
                .mapToInt(Block::getLogCount)
                .sum() + currentBlockLogs.size();

        stats.put("totalLogs", totalLogs);
        stats.put("pendingLogs", currentBlockLogs.size());
        stats.put("totalBlocks", blocks.size());
        stats.put("chainLength", hashChain.size());
        stats.put("latestRootHash", getLatestRootHash());
        
        return Collections.unmodifiableMap(stats);
    }

    /**
     * Clears all audit data (for testing or reset purposes).
     */
    public synchronized void clear() {
        currentBlockLogs.clear();
        blocks.clear();
        hashChain.clear();
        logger.info("All audit data cleared");
    }

    /**
     * Gets a specific block by its ID.
     */
    public Block getBlock(String blockId) {
        return blocks.get(blockId);
    }

    /**
     * Checks if there are any pending logs that need to be finalized.
     */
    public boolean hasPendingLogs() {
        return !currentBlockLogs.isEmpty();
    }

    /**
     * Gets the count of pending logs.
     */
    public int getPendingLogCount() {
        return currentBlockLogs.size();
    }

    /**
     * Gets the count of finalized blocks.
     */
    public int getBlockCount() {
        return blocks.size();
    }
}
