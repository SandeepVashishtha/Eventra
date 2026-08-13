package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.concurrent.locks.ReentrantLock;

/**
 * Transaction Synchronization Adapter (#14078, #14507).
 * Releases a lock when the active DB transaction finishes, regardless of the
 * outcome (commit, rollback or unknown), so the lock can never be leaked by a
 * rolled-back transaction.
 */
@Component
public class TransactionLockSyncAdapter {

    public void registerReleaseOnCompletion(ReentrantLock lock) {
        if (lock == null) {
            return;
        }
        registerReleaseOnCompletion(lock, null);
    }

    public void registerReleaseOnCompletion(ReentrantLock lock, Runnable afterRelease) {
        if (lock == null) {
            return;
        }
        Runnable cleanup = () -> {
            // Releases on STATUS_COMMITTED, STATUS_ROLLED_BACK and STATUS_UNKNOWN.
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
            if (afterRelease != null) {
                afterRelease.run();
            }
        };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCompletion(int status) {
                    cleanup.run();
                }
            });
        } else {
            // No active transaction; release immediately
            cleanup.run();
        }
    }
}
