package com.sandeep.eventrabackend.security.audit;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service managing user transaction log sequences and audit verification (#17665).
 */
@Service
public class AuditLogManager {

    private final MerkleTreeHasher hasher;
    private final List<String> systemLogs = new CopyOnWriteArrayList<>();

    public AuditLogManager(MerkleTreeHasher hasher) {
        this.hasher = hasher;
        systemLogs.add("User Registration 01");
        systemLogs.add("Ticket Purchased VIP");
    }

    public synchronized void appendLog(String logEntry) {
        systemLogs.add(logEntry);
    }

    public String getMerkleRoot() {
        return hasher.computeMerkleRoot(systemLogs);
    }

    public List<String> getSystemLogs() {
        return systemLogs;
    }
}
