package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Purchase service preventing capacity write skew overselling (#16469).
 */
@Service
public class PurchaseService {

    private final Map<String, AtomicInteger> ticketTiers = new ConcurrentHashMap<>();
    private final AtomicInteger totalSold = new AtomicInteger(0);
    private final int eventCapacity = 200;

    public PurchaseService() {
        ticketTiers.put("VIP", new AtomicInteger(50));
        ticketTiers.put("GENERAL", new AtomicInteger(150));
    }

    /**
     * Enforce atomic capacity checks and decrements to prevent overselling.
     */
    @Transactional
    public synchronized boolean purchaseTicket(String tier, int quantity) {
        if (quantity <= 0) {
            return false;
        }
        AtomicInteger tierCapacity = ticketTiers.get(tier);
        if (tierCapacity == null) {
            return false;
        }
        int currentTier = tierCapacity.get();
        int currentTotal = totalSold.get();
        if (currentTier >= quantity && (currentTotal + quantity) <= eventCapacity) {
            tierCapacity.addAndGet(-quantity);
            totalSold.addAndGet(quantity);
            return true;
        }
        return false;
    }

    public int getRemainingCapacity() {
        return eventCapacity - totalSold.get();
    }
}
