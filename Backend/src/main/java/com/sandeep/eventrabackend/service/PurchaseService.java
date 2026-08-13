package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Purchase service preventing capacity write skew overselling (#16469).
 */
@Service
public class PurchaseService {

    private final Map<String, Integer> ticketTiers = new ConcurrentHashMap<>();
    private final ReentrantLock eventLock = new ReentrantLock();
    private int eventCapacity = 200;
    private int totalSold = 0;

    public PurchaseService() {
        ticketTiers.put("VIP", 50);
        ticketTiers.put("GENERAL", 150);
    }

    /**
     * Enforce pessimistic write lock patterns on parent event scope capacities.
     */
    @Transactional
    public boolean purchaseTicket(String tier, int quantity) {
        if (quantity <= 0) {
            return false;
        }
        eventLock.lock();
        try {
            int tierCapacity = ticketTiers.getOrDefault(tier, 0);
            if (tierCapacity >= quantity && (totalSold + quantity) <= eventCapacity) {
                ticketTiers.put(tier, tierCapacity - quantity);
                totalSold += quantity;
                return true;
            }
            return false;
        } finally {
            eventLock.unlock();
        }
    }

    public int getRemainingCapacity() {
        return eventCapacity - totalSold;
    }
}
