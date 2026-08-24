package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.model.AddonInventory;
import com.sandeep.eventrabackend.repository.AddonInventoryRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Dynamic Ticket Upgrade and Perks Allocation Service (#16283, #19087).
 * Uses JPA repository with atomic database updates to ensure quota persistence across restarts
 * and consistent limits across horizontally-scaled application instances.
 */
@Service
public class UpgradeService {

    private final AddonInventoryRepository addonInventoryRepository;
    private final Map<String, String> ticketTiers = new ConcurrentHashMap<>();

    public UpgradeService(AddonInventoryRepository addonInventoryRepository) {
        this.addonInventoryRepository = addonInventoryRepository;
        ticketTiers.put("TICKET_01", "GENERAL");
    }

    @PostConstruct
    public void initInventory() {
        // Idempotent initial seed of default add-on quotas if not already present in database
        if (!addonInventoryRepository.existsById("VIP_LOUNGE_PASS")) {
            addonInventoryRepository.save(new AddonInventory("VIP_LOUNGE_PASS", 15));
        }
    }

    @Transactional
    public boolean upgradeTicket(String ticketId, String targetTier) {
        if (!ticketTiers.containsKey(ticketId)) {
            return false;
        }

        ticketTiers.put(ticketId, targetTier);
        return true;
    }

    @Transactional
    public boolean allocateAddon(String addonId) {
        int updated = addonInventoryRepository.decrementRemainingIfPositive(addonId);
        return updated > 0;
    }

    public int getRemainingAddonQuota(String addonId) {
        return addonInventoryRepository.findById(addonId)
                .map(AddonInventory::getRemaining)
                .orElse(0);
    }

    public String getTicketTier(String ticketId) {
        return ticketTiers.get(ticketId);
    }
}
