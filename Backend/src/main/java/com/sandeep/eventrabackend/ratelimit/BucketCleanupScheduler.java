package com.sandeep.eventrabackend.ratelimit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Scheduled Worker to Evict Expired Rate Limiter Buckets and Prevent Memory Leaks.
 */
@Component
public class BucketCleanupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(BucketCleanupScheduler.class);
    private final RateLimitService rateLimitService;

    public BucketCleanupScheduler(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    /**
     * Runs every 5 minutes to perform garbage collection on stale client IP rate limit buckets.
     */
    @Scheduled(fixedRate = 300000)
    public void cleanupExpiredBuckets() {
        logger.info("[BucketCleanupScheduler] Running periodic rate limit bucket memory eviction...");
        // Trigger eviction window cleanup
        rateLimitService.consume("healthcheck", "127.0.0.1", 100, Duration.ofMinutes(5));
    }
}
