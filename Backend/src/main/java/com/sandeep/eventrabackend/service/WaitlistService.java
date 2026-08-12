package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service managing event waitlist promotions with strict idempotency token deduplication.
 * Prevents double-claiming seat allocations during Service Worker background sync retries.
 */
@Service
public class WaitlistService {

    private final Set<String> processedPromotionTokens = ConcurrentHashMap.newKeySet();

    /**
     * Process waitlist promotion acceptance.
     * Returns true if successfully processed, false if duplicate/already processed.
     */
    public boolean confirmPromotion(String promotionToken, String userId, String eventId) {
        if (promotionToken == null || promotionToken.trim().isEmpty()) {
            return false;
        }

        // Idempotency Mutex Lock: reject duplicate confirmations for the same promotion token
        if (!processedPromotionTokens.add(promotionToken)) {
            return false; // Already processed
        }

        // Proceed with seat allocation logic
        return true;
    }

    public boolean isTokenProcessed(String promotionToken) {
        return processedPromotionTokens.contains(promotionToken);
    }
}
