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
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCompletion(int status) {
                    // Releases on STATUS_COMMITTED, STATUS_ROLLED_BACK and STATUS_UNKNOWN.
                    if (lock.isHeldByCurrentThread()) {
                        lock.unlock();
                    }
                }
            });
        } else {
            // No active transaction; release immediately
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
