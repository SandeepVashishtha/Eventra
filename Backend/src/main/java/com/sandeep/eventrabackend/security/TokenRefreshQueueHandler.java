package com.sandeep.eventrabackend.security;

import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Handles Grace-Period Token Reuse during Concurrent Refresh Bursts.
 * Prevents 403 Forbidden responses when multiple parallel requests use
 * a recently rotated refresh token within a brief 10-second grace window.
 *
 * <p>The grace state now lives behind a {@link TokenGraceStore} rather than a
 * private per-instance map. Two handler instances that share the same store
 * (e.g. via dependency injection, or a shared cluster-wide implementation such
 * as Redis/DB) will honour a single grace window, fixing spurious 403s that
 * previously occurred when a parallel request landed on a different instance
 * than the one that rotated the token.
 */
@Component
public class TokenRefreshQueueHandler {

    private static final long GRACE_PERIOD_MS = 10000; // 10 seconds

    /**
     * Safety cap so a pathological rotation burst can never exhaust the heap.
     */
    private static final int MAX_GRACE_ENTRIES = 100_000;

    private static final String TOKEN_HASH_ALGORITHM = "SHA-256";

    private final TokenGraceStore graceStore;

    /**
     * Default constructor used by Spring — keeps the original per-JVM behaviour
     * via an in-process store. For multi-instance deployments, inject a shared
     * {@link TokenGraceStore} implementation instead.
     */
    public TokenRefreshQueueHandler() {
        this(new InMemoryTokenGraceStore(MAX_GRACE_ENTRIES));
    }

    /**
     * Constructor for tests / explicit dependency injection. Supplying the same
     * store to multiple handler instances lets them share one grace window.
     *
     * @param graceStore the shared grace store
     */
    public TokenRefreshQueueHandler(TokenGraceStore graceStore) {
        this.graceStore = graceStore;
    }

    /**
     * Mark a consumed refresh token into grace period storage.
     */
    public void registerTokenRotation(String oldToken) {
        if (oldToken == null) {
            return;
        }
        graceStore.registerRotation(hashToken(oldToken), GRACE_PERIOD_MS);
    }

    /**
     * Check if an invalidated refresh token is still within its active grace period window.
     */
    public boolean isWithinGracePeriod(String token) {
        if (token == null) {
            return false;
        }
        return graceStore.isWithinGrace(hashToken(token), GRACE_PERIOD_MS);
    }

    private static String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance(TOKEN_HASH_ALGORITHM);
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
