package com.sandeep.eventrabackend.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service managing event waitlist promotions with strict idempotency token deduplication.
 * Prevents double-claiming seat allocations during Service Worker background sync retries.
 *
 * <p>The source of truth for a processed promotion token is a Redis {@code SET NX} key with a
 * 24h TTL, which is atomic, shared across all application instances behind a load balancer, and
 * durable across restarts. The in-memory set is only a best-effort fast path and is never used as
 * the source of truth, so a restart or a second instance cannot re-confirm the same token.
 */
@Service
public class WaitlistService {

    private static final String PROMOTION_TOKEN_KEY_PREFIX = "waitlist:promotion-token:";
    private static final Duration PROMOTION_TOKEN_TTL = Duration.ofHours(24);

    private final StringRedisTemplate redisTemplate;
    private final Set<String> processedPromotionTokens = ConcurrentHashMap.newKeySet();

    public WaitlistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Process waitlist promotion acceptance.
     * Returns true if successfully processed, false if duplicate/already processed.
     *
     * <p>The caller must perform the actual seat allocation (e.g. the
     * {@code WAITING -> PROMOTED} transition plus the {@code CONFIRMED} registration) within the
     * same database transaction as this call, so the idempotency record and the allocation commit
     * or roll back together.
     */
    public boolean confirmPromotion(String promotionToken, String userId, String eventId) {
        if (promotionToken == null || promotionToken.trim().isEmpty() || !promotionToken.matches("^[a-zA-Z0-9-]{8,64}$")) {
            return false;
        }

        // Best-effort fast path only; never the source of truth.
        if (processedPromotionTokens.contains(promotionToken)) {
            return false; // Already processed
        }

        // Atomic, cross-instance, TTL-bounded dedup: SET NX is the source of truth.
        // Fails closed if Redis is unavailable rather than silently re-introducing
        // the double-claim risk.
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(key(promotionToken), "1", PROMOTION_TOKEN_TTL);
        if (acquired == null || !acquired) {
            return false; // Already processed by this or another instance
        }

        processedPromotionTokens.add(promotionToken);
        return true;
    }

    public boolean isTokenProcessed(String promotionToken) {
        if (promotionToken == null || promotionToken.trim().isEmpty() || !promotionToken.matches("^[a-zA-Z0-9-]{8,64}$")) {
            return false;
        }
        if (processedPromotionTokens.contains(promotionToken)) {
            return true;
        }
        return Boolean.TRUE.equals(redisTemplate.hasKey(key(promotionToken)));
    }

    private String key(String promotionToken) {
        return PROMOTION_TOKEN_KEY_PREFIX + promotionToken;
    }
}
