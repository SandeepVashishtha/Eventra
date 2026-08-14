package com.sandeep.eventrabackend.ratelimit;

import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Distributed Sliding Window Rate Limiter (#14076).
 * Tracks millisecond request logs per identifier to prevent burst limits at window boundaries.
 */
@Component
public class SlidingWindowRateLimiter {

    private final Map<String, List<Long>> requestLogs = new ConcurrentHashMap<>();

    /**
     * Determine if a client request exceeds threshold rules.
     * @param clientKey identifier key (e.g. IP or JWT subject)
     * @param maxRequests maximum request threshold in window
     * @param windowSeconds duration of sliding window in seconds
     */
    public boolean isAllowed(String clientKey, int maxRequests, long windowSeconds) {
        if (clientKey == null) return true;

        long currentTimeMs = System.currentTimeMillis();
        long windowStartMs = currentTimeMs - (windowSeconds * 1000);

        requestLogs.putIfAbsent(clientKey, Collections.synchronizedList(new ArrayList<>()));
        List<Long> timestamps = requestLogs.get(clientKey);

        synchronized (timestamps) {
            // Remove timestamps older than current window
            timestamps.removeIf(t -> t < windowStartMs);

            if (timestamps.isEmpty()) {
                // Forget idle clients so the map stays bounded; a fresh entry
                // is recreated lazily on the next request.
                requestLogs.remove(clientKey, timestamps);
                return true;
            }

            if (timestamps.size() < maxRequests) {
                timestamps.add(currentTimeMs);
                return true;
            }
            return false;
        }
    }

    public int getRemainingRequests(String clientKey, int maxRequests) {
        List<Long> timestamps = requestLogs.get(clientKey);
        if (timestamps == null) return maxRequests;
        synchronized (timestamps) {
            return Math.max(0, maxRequests - timestamps.size());
        }
    }
}
