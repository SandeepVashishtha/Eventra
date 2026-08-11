package com.sandeep.eventrabackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * DB-backed coupon inventory (#14507).
 *
 * A coupon code maps to a remaining usage count that is decremented atomically
 * inside the surrounding database transaction, so a rollback restores the slot.
 */
@Entity
@Table(name = "coupon_inventory")
public class CouponInventory {

    @Id
    @Column(name = "code", length = 64, nullable = false)
    private String code;

    @Column(name = "remaining", nullable = false)
    private int remaining;

    public CouponInventory() {
    }

    public CouponInventory(String code, int remaining) {
        this.code = code;
        this.remaining = remaining;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public int getRemaining() {
        return remaining;
    }

    public void setRemaining(int remaining) {
        this.remaining = remaining;
    }
}
