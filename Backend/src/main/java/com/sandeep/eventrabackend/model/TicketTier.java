package com.sandeep.eventrabackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * DB-backed ticket tier capacity (#17833).
 *
 * Per-tier remaining capacity is stored in the database so it is shared
 * across application instances and survives restarts, and is decremented
 * atomically inside the surrounding database transaction.
 */
@Entity
@Table(name = "ticket_tier")
public class TicketTier {

    @Id
    @Column(name = "tier", length = 64, nullable = false)
    private String tier;

    @Column(name = "remaining", nullable = false)
    private int remaining;

    public TicketTier() {
    }

    public TicketTier(String tier, int remaining) {
        this.tier = tier;
        this.remaining = remaining;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public int getRemaining() {
        return remaining;
    }

    public void setRemaining(int remaining) {
        this.remaining = remaining;
    }
}
