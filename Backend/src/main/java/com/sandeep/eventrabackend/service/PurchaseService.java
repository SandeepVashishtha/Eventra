package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.model.TicketTier;
import com.sandeep.eventrabackend.repository.TicketTierRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Purchase service enforcing ticket capacity against the database (#17833).
 *
 * Per-tier capacity is stored in {@code ticket_tier} and decremented atomically
 * inside the surrounding transaction, so concurrent purchases across all
 * instances (and restarts) can never oversell or lose sold counts.
 */
@Service
public class PurchaseService {

    private static final String VIP_TIER = "VIP";
    private static final String GENERAL_TIER = "GENERAL";
    private static final int VIP_CAPACITY = 50;
    private static final int GENERAL_CAPACITY = 150;

    private final TicketTierRepository ticketTierRepository;

    public PurchaseService(TicketTierRepository ticketTierRepository) {
        this.ticketTierRepository = ticketTierRepository;
    }

    /**
     * Ensures the seeded tiers exist once the application is ready (covers
     * dev/test profiles where Flyway is disabled and Hibernate owns the schema).
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedTiersIfAbsent() {
        if (ticketTierRepository.findByTier(VIP_TIER).isEmpty()) {
            ticketTierRepository.save(new TicketTier(VIP_TIER, VIP_CAPACITY));
        }
        if (ticketTierRepository.findByTier(GENERAL_TIER).isEmpty()) {
            ticketTierRepository.save(new TicketTier(GENERAL_TIER, GENERAL_CAPACITY));
        }
    }

    /**
     * Atomically decrements the tier's remaining capacity in the database.
     * The UPDATE is guarded by {@code remaining >= quantity}, so concurrent
     * purchases across all instances can never oversell.
     */
    @Transactional
    public boolean purchaseTicket(String tier, int quantity) {
        if (quantity <= 0) {
            return false;
        }
        return ticketTierRepository.decrementRemainingIfAvailable(tier, quantity) > 0;
    }

    /**
     * Remaining capacity across all tiers, read from the shared store.
     */
    @Transactional(readOnly = true)
    public int getRemainingCapacity() {
        return ticketTierRepository.sumRemaining();
    }
}
