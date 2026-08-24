package com.sandeep.eventrabackend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

/**
 * Entity representing persisted add-on quotas and inventory (#19087).
 */
@Entity
@Table(name = "addon_inventory")
public class AddonInventory {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "remaining", nullable = false)
    private Integer remaining;

    public AddonInventory() {}

    public AddonInventory(String id, Integer remaining) {
        this.id = id;
        this.remaining = remaining;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getRemaining() {
        return remaining;
    }

    public void setRemaining(Integer remaining) {
        this.remaining = remaining;
    }
}
