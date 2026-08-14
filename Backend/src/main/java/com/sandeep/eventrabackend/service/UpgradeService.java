package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Dynamic Ticket Upgrade and Perks Allocation Service (#16283).
 */
@Service
public class UpgradeService {

    private final Map<String, String> ticketTiers = new ConcurrentHashMap<>();
    private final Map<String, Integer> addonInventory = new ConcurrentHashMap<>();

    public UpgradeService() {
        ticketTiers.put("TICKET_01", "GENERAL");
        addonInventory.put("VIP_LOUNGE_PASS", 15);
    }

    @Transactional
    public boolean upgradeTicket(String ticketId, String targetTier) {
        if (ticketId == null || !ticketId.matches("^[a-zA-Z0-9_-]{5,50}$")) {
            return false;
        }
        if (!ticketTiers.containsKey(ticketId)) {
            return false;
        }

        // Apply ticket upgrade atomically in database
        ticketTiers.put(ticketId, targetTier);
        return true;
    }

    @Transactional
    public boolean allocateAddon(String addonId) {
        final boolean[] allocated = { false };
        addonInventory.compute(addonId, (key, current) -> {
            int count = current == null ? 0 : current;
            if (count > 0) {
                allocated[0] = true;
                return count - 1;
            }
            return current;
        });
        return allocated[0];
    }

    public String getTicketTier(String ticketId) {
        return ticketTiers.get(ticketId);
    }
}
