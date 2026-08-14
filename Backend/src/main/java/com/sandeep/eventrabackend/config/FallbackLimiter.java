package com.sandeep.eventrabackend.config;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory fallback rate limiter activated during Redis cluster network drops (#16543).
 */
@Component
public class FallbackLimiter {

    private final Map<String, Integer> requestCounts = new ConcurrentHashMap<>();

    public boolean isAllowedLocal(String clientKey, int maxLimit) {
        if (clientKey == null) return true;

        try {
            final boolean[] allowed = {false};
            requestCounts.compute(clientKey, (key, current) -> {
                int count = current == null ? 0 : current;
                if (count < maxLimit) {
                    allowed[0] = true;
                    return count + 1;
                }
                return count;
            });
            return allowed[0];
        } catch (Exception e) {
            // Log local check failure and fail open to prevent blocking clients
            return true;
        }
    }

    public void resetLocalLimits() {
        requestCounts.clear();
    }
}
