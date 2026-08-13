package com.sandeep.eventrabackend.security;

/**
 * Shared store for refresh-token rotation "grace" entries.
 *
 * <p>When a refresh token is rotated, the old token is briefly allowed (within a
 * grace window) so that concurrent requests carrying the same just-rotated token
 * are not rejected as replays. The grace state must be effective cluster-wide:
 * behind a load balancer, the request that presents the old token may land on a
 * different instance than the one that performed the rotation.
 *
 * <p>The default {@link InMemoryTokenGraceStore} keeps state per-JVM. For a
 * multi-instance deployment, supply a shared implementation (e.g. backed by
 * Redis or the database) so every instance honours the same grace window.
 */
public interface TokenGraceStore {

    /**
     * Record that the given (already-hashed) token was rotated now.
     *
     * @param tokenHash     SHA-256 hash of the rotated token (fixed-size key)
     * @param gracePeriodMs grace window length in milliseconds
     */
    void registerRotation(String tokenHash, long gracePeriodMs);

    /**
     * @param tokenHash     SHA-256 hash of the token to check
     * @param gracePeriodMs grace window length in milliseconds
     * @return true if the token was rotated within the grace window
     */
    boolean isWithinGrace(String tokenHash, long gracePeriodMs);

    /**
     * Drop entries whose grace window has elapsed.
     *
     * @param gracePeriodMs grace window length in milliseconds
     */
    void pruneExpired(long gracePeriodMs);
}
