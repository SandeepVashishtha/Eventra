package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Coupon Redemption Service (#14078).
 * Integrates TransactionLockSyncAdapter to resolve post-commit lock eviction races.
 */
@Service
public class CouponService {

    private final TransactionLockSyncAdapter syncAdapter;
    private final ConcurrentHashMap<String, ReentrantLock> locks = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Integer> couponInventory = new ConcurrentHashMap<>();

    public CouponService(TransactionLockSyncAdapter syncAdapter) {
        this.syncAdapter = syncAdapter;
        // Seed some sample coupon data
        couponInventory.put("SUMMER10", 5);
    }

    @Transactional
    public boolean redeemCoupon(String code) {
        ReentrantLock lock = locks.computeIfAbsent(code, k -> new ReentrantLock());
        lock.lock();

        try {
            // Register callback to release lock ONLY after transactional commit
            syncAdapter.registerPostCommitRelease(lock);

            int remaining = couponInventory.getOrDefault(code, 0);
            if (remaining > 0) {
                couponInventory.put(code, remaining - 1);
                return true;
            }
            return false;
        } catch (Exception e) {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
            throw e;
        }
    }

    public int getRemainingUses(String code) {
        return couponInventory.getOrDefault(code, 0);
    }
}
