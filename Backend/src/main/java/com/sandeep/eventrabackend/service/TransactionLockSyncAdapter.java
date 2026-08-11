package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.concurrent.locks.ReentrantLock;

/**
 * Transaction Synchronization Adapter (#14078).
 * Releases a lock ONLY after the active DB transaction has successfully committed.
 */
@Component
public class TransactionLockSyncAdapter {

    public void registerPostCommitRelease(ReentrantLock lock) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
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
