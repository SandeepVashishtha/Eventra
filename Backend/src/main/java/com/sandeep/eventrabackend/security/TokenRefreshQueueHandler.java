package com.sandeep.eventrabackend.security;

import org.springframework.stereotype.Component;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handles Grace-Period Token Reuse during Concurrent Refresh Bursts.
 * Prevents 403 Forbidden responses when multiple parallel requests use
 * a recently rotated refresh token within a brief 10-second grace window.
 */
@Component
public class TokenRefreshQueueHandler {

    private static final long GRACE_PERIOD_MS = 10000; // 10 seconds
    private final ConcurrentHashMap<String, Long> invalidatedTokenGraceMap = new ConcurrentHashMap<>();

    /**
     * Mark a consumed refresh token into grace period storage.
     */
    public void registerTokenRotation(String oldToken) {
        if (oldToken != null) {
            invalidatedTokenGraceMap.put(oldToken, System.currentTimeMillis());
        }
    }

    /**
     * Check if an invalidated refresh token is still within its active grace period window.
     */
    public boolean isWithinGracePeriod(String token) {
        if (token == null || !invalidatedTokenGraceMap.containsKey(token)) {
            return false;
        }

        long rotationTime = invalidatedTokenGraceMap.get(token);
        boolean isGraceful = (System.currentTimeMillis() - rotationTime) <= GRACE_PERIOD_MS;

        if (!isGraceful) {
            invalidatedTokenGraceMap.remove(token);
        }

        return isGraceful;
    }
}
