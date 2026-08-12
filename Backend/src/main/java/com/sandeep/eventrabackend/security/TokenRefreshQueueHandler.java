package com.sandeep.eventrabackend.security;

import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handles Grace-Period Token Reuse during Concurrent Refresh Bursts.
 * Prevents 403 Forbidden responses when multiple parallel requests use
 * a recently rotated refresh token within a brief 10-second grace window.
 */
@Component
public class TokenRefreshQueueHandler {

    private static final long GRACE_PERIOD_MS = 10000; // 10 seconds

    /**
     * Safety cap so a pathological rotation burst can never exhaust the heap.
     */
    private static final int MAX_GRACE_ENTRIES = 100_000;

    private static final String TOKEN_HASH_ALGORITHM = "SHA-256";

    /**
     * SHA-256 digests of rotated tokens keyed by rotation time, keeping map
     * keys fixed-size instead of storing full (hundreds-of-bytes) JWTs.
     */
    private final ConcurrentHashMap<String, Long> invalidatedTokenGraceMap = new ConcurrentHashMap<>();

    /**
     * Mark a consumed refresh token into grace period storage.
     */
    public void registerTokenRotation(String oldToken) {
        if (oldToken == null) {
            return;
        }
        purgeExpired();
        if (invalidatedTokenGraceMap.size() < MAX_GRACE_ENTRIES) {
            invalidatedTokenGraceMap.put(hashToken(oldToken), System.currentTimeMillis());
        }
    }

    /**
     * Check if an invalidated refresh token is still within its active grace period window.
     */
    public boolean isWithinGracePeriod(String token) {
        if (token == null) {
            return false;
        }
        purgeExpired();
        Long rotationTime = invalidatedTokenGraceMap.get(hashToken(token));
        return rotationTime != null
                && (System.currentTimeMillis() - rotationTime) <= GRACE_PERIOD_MS;
    }

    /**
     * Drop entries whose grace window has elapsed so the map stays bounded by
     * the number of rotations within the last {@link #GRACE_PERIOD_MS} window
     * instead of growing for the lifetime of the process.
     */
    private void purgeExpired() {
        long now = System.currentTimeMillis();
        invalidatedTokenGraceMap.entrySet()
                .removeIf(entry -> now - entry.getValue() > GRACE_PERIOD_MS);
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
