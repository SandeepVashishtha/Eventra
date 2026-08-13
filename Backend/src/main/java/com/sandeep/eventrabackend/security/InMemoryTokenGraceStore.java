package com.sandeep.eventrabackend.security;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Default {@link TokenGraceStore} backed by an in-process {@link ConcurrentHashMap}.
 *
 * <p>This preserves the original per-JVM behaviour. Two handler instances that
 * share the SAME store (e.g. via dependency injection in a test, or a singleton
 * bean in a single-instance deployment) will honour a unified grace window,
 * which is what makes cross-instance grace possible. For true cluster-wide
 * sharing, replace this with a Redis/DB-backed implementation.
 */
public class InMemoryTokenGraceStore implements TokenGraceStore {

    /**
     * Safety cap so a pathological rotation burst can never exhaust the heap.
     */
    private final int maxEntries;

    private final ConcurrentHashMap<String, Long> graceMap = new ConcurrentHashMap<>();

    public InMemoryTokenGraceStore() {
        this(100_000);
    }

    public InMemoryTokenGraceStore(int maxEntries) {
        this.maxEntries = maxEntries;
    }

    @Override
    public void registerRotation(String tokenHash, long gracePeriodMs) {
        if (tokenHash == null) {
            return;
        }
        pruneExpired(gracePeriodMs);
        if (graceMap.size() < maxEntries) {
            graceMap.put(tokenHash, System.currentTimeMillis());
        }
    }

    @Override
    public boolean isWithinGrace(String tokenHash, long gracePeriodMs) {
        if (tokenHash == null) {
            return false;
        }
        pruneExpired(gracePeriodMs);
        Long rotationTime = graceMap.get(tokenHash);
        return rotationTime != null
                && (System.currentTimeMillis() - rotationTime) <= gracePeriodMs;
    }

    @Override
    public void pruneExpired(long gracePeriodMs) {
        long now = System.currentTimeMillis();
        graceMap.entrySet().removeIf(entry -> now - entry.getValue() > gracePeriodMs);
    }
}
