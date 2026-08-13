package com.sandeep.eventrabackend.security;

import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OIDC Key Cache Invalidation Manager with protection against token validation spam (#16468).
 */
@Component
public class OidcKeyCacheManager {

    private final Map<String, String> cachedKeys = new ConcurrentHashMap<>();
    private long lastCacheRefreshTime = 0;
    private static final long COOLDOWN_PERIOD_MS = 300000; // 5-minute cooldown

    public OidcKeyCacheManager() {
        cachedKeys.put("kid_v1", "public_key_v1");
    }

    public synchronized String getPublicKey(String kid) {
        if (!cachedKeys.containsKey(kid)) {
            // Unrecognized kid; check if cooldown window has expired before refreshing cache
            long now = System.currentTimeMillis();
            if (now - lastCacheRefreshTime > COOLDOWN_PERIOD_MS) {
                refreshCache();
                lastCacheRefreshTime = now;
            }
        }
        return cachedKeys.get(kid);
    }

    private void refreshCache() {
        // Simulate fetching updated OIDC provider keys
        cachedKeys.put("kid_v2", "public_key_v2");
    }

    public void invalidateCache() {
        cachedKeys.clear();
        lastCacheRefreshTime = 0;
    }
}
