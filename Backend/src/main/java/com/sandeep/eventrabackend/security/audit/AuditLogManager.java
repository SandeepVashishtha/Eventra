package com.sandeep.eventrabackend.security.audit;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Audit Log Manager retaining historical actions securely (#16268).
 */
@Service
public class AuditLogManager {

    private final MerkleTreeHasher hasher;
    private final List<String> currentBlockLogs = new CopyOnWriteArrayList<>();
    private final Map<String, String> blockRoots = new HashMap<>();

    public AuditLogManager(MerkleTreeHasher hasher) {
        this.hasher = hasher;
    }

    public synchronized void recordAction(String action) {
        currentBlockLogs.add(action);
        if (currentBlockLogs.size() >= 4) {
            String blockId = "block_" + System.currentTimeMillis();
            String rootHash = hasher.computeRootHash(new ArrayList<>(currentBlockLogs));
            blockRoots.put(blockId, rootHash);
            currentBlockLogs.clear();
        }
    }

    public Map<String, String> getBlockRoots() {
        return blockRoots;
    }
}
