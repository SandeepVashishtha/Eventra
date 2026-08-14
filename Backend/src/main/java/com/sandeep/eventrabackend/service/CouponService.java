package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.exception.CouponRedemptionException;
import com.sandeep.eventrabackend.model.CouponInventory;
import com.sandeep.eventrabackend.repository.CouponInventoryRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Coupon Redemption Service (#14078, #14507).
 *
 * Inventory is DB-backed (coupon_inventory) and decremented atomically inside
 * the surrounding transaction, so a rollback restores the consumed slot. The
 * per-code {@link ReentrantLock} is only a same-JVM ordering guard and is
 * always released when the transaction finishes (commit or rollback).
 */
@Service
public class CouponService implements ApplicationRunner {

    private static final String SEED_COUPON_CODE = "SUMMER10";
    private static final int SEED_COUPON_USES = 5;
    private static final long LOCK_WAIT_SECONDS = 5L;

    private final TransactionLockSyncAdapter syncAdapter;
    private final CouponInventoryRepository couponInventoryRepository;
    private final ConcurrentHashMap<String, ReentrantLock> locks = new ConcurrentHashMap<>();

    public CouponService(TransactionLockSyncAdapter syncAdapter, CouponInventoryRepository couponInventoryRepository) {
        this.syncAdapter = syncAdapter;
        this.couponInventoryRepository = couponInventoryRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        // Preserve the sample coupon previously seeded in-memory. Idempotent:
        // existing counts (incl. the DB seed from V6__coupon_inventory.sql) are
        // left untouched.
        if (couponInventoryRepository.findById(SEED_COUPON_CODE).isEmpty()) {
            couponInventoryRepository.save(new CouponInventory(SEED_COUPON_CODE, SEED_COUPON_USES));
        }
    }

    @Transactional
    public boolean redeemCoupon(String code) {
        if (code == null) return false;
        code = code.trim().toUpperCase();
        ReentrantLock lock = locks.computeIfAbsent(code, k -> new ReentrantLock());
        boolean acquired;
        try {
            acquired = lock.tryLock(LOCK_WAIT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            locks.remove(code, lock);
            Thread.currentThread().interrupt();
            throw new CouponRedemptionException("Interrupted while acquiring coupon lock for code: " + code, e);
        }
        if (!acquired) {
            // Not acquired: no other holder will release this entry for us.
            locks.remove(code, lock);
            throw new CouponRedemptionException(
                    "Timed out after " + LOCK_WAIT_SECONDS + "s acquiring coupon lock for code: " + code);
        }

        try {
            // Release the lock when the transaction finishes, whether it
            // commits or rolls back (#14507) — afterCommit alone leaks the
            // lock permanently on rollback — then evict the per-code entry so
            // the lock map stays bounded.
            syncAdapter.registerReleaseOnCompletion(lock, () -> locks.remove(code, lock));

            // Atomic, DB-backed decrement guarded by remaining > 0, executed in
            // the current transaction; rollback restores the slot.
            return couponInventoryRepository.decrementRemaining(code) > 0;
        } catch (Exception e) {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public int getRemainingUses(String code) {
        if (code == null) return 0;
        code = code.trim().toUpperCase();
        return couponInventoryRepository.findById(code)
                .map(CouponInventory::getRemaining)
                .orElse(0);
    }
}
