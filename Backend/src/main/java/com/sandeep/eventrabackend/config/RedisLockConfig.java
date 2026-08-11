package com.sandeep.eventrabackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Distributed Lock Configuration for Flash Event Registrations.
 * Provides lock synchronization primitives to prevent database deadlock conditions.
 */
@Configuration
public class RedisLockConfig {

    private final ConcurrentHashMap<String, ReentrantLock> lockRegistry = new ConcurrentHashMap<>();

    public ReentrantLock getRegistrationLock(String eventId) {
        return lockRegistry.computeIfAbsent(eventId, k -> new ReentrantLock());
    }

    public void releaseLock(String eventId) {
        ReentrantLock lock = lockRegistry.get(eventId);
        if (lock != null && lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}
