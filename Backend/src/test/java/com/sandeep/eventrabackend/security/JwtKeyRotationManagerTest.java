package com.sandeep.eventrabackend.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

public class JwtKeyRotationManagerTest {

    private SecretKey createKey(String name) {
        byte[] bytes = (name + "-secret-key-padding-32-bytes-long!").getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Test
    @DisplayName("rotateKeys updates current key and retains grace keys up to MAX_RETAINED_KEYS")
    void testRotationAndGraceKeys() {
        JwtKeyRotationManager manager = new JwtKeyRotationManager();

        assertNull(manager.getCurrentKey());
        assertTrue(manager.getGraceKeys().isEmpty());

        SecretKey key1 = createKey("key1");
        SecretKey key2 = createKey("key2");
        SecretKey key3 = createKey("key3");

        // Rotate key 1
        manager.rotateKeys("k1", key1);
        assertEquals("k1", manager.getCurrentKeyId());
        assertEquals(key1, manager.getCurrentKey());
        assertTrue(manager.getGraceKeys().isEmpty());

        // Rotate key 2
        manager.rotateKeys("k2", key2);
        assertEquals("k2", manager.getCurrentKeyId());
        assertEquals(key2, manager.getCurrentKey());
        List<SecretKey> grace1 = manager.getGraceKeys();
        assertEquals(1, grace1.size());
        assertEquals(key1, grace1.get(0));

        // Rotate key 3 -> key1 evicted, grace contains key2
        manager.rotateKeys("k3", key3);
        assertEquals("k3", manager.getCurrentKeyId());
        assertEquals(key3, manager.getCurrentKey());
        List<SecretKey> grace2 = manager.getGraceKeys();
        assertEquals(1, grace2.size());
        assertEquals(key2, grace2.get(0));
        assertNull(manager.getKey("k1"));
    }

    @Test
    @DisplayName("Concurrent key rotation and grace key reads execute safely without ConcurrentModificationException")
    void testConcurrentKeyRotationAndReads() throws Exception {
        JwtKeyRotationManager manager = new JwtKeyRotationManager();

        // Seed initial key
        manager.rotateKeys("k0", createKey("k0"));

        int numReaders = 8;
        int numWriters = 2;
        int testDurationMs = 1500;

        ExecutorService executor = Executors.newFixedThreadPool(numReaders + numWriters);
        CountDownLatch startLatch = new CountDownLatch(1);
        AtomicBoolean running = new AtomicBoolean(true);
        AtomicReference<Throwable> firstException = new AtomicReference<>(null);

        List<Future<?>> futures = new ArrayList<>();

        // Reader threads
        for (int i = 0; i < numReaders; i++) {
            futures.add(executor.submit(() -> {
                try {
                    startLatch.await();
                    while (running.get()) {
                        manager.getCurrentKey();
                        manager.getCurrentKeyId();
                        List<SecretKey> graceKeys = manager.getGraceKeys();
                        assertNotNull(graceKeys);
                    }
                } catch (Throwable t) {
                    firstException.compareAndSet(null, t);
                }
            }));
        }

        // Writer threads (Key Rotators)
        for (int i = 0; i < numWriters; i++) {
            final int writerId = i;
            futures.add(executor.submit(() -> {
                try {
                    startLatch.await();
                    int counter = 0;
                    while (running.get()) {
                        String keyId = "k-" + writerId + "-" + counter++;
                        SecretKey key = createKey(keyId);
                        manager.rotateKeys(keyId, key);
                        Thread.yield();
                    }
                } catch (Throwable t) {
                    firstException.compareAndSet(null, t);
                }
            }));
        }

        // Start all threads simultaneously
        startLatch.countDown();

        Thread.sleep(testDurationMs);
        running.set(false);

        executor.shutdown();
        assertTrue(executor.awaitTermination(5, TimeUnit.SECONDS), "Executor failed to terminate cleanly");

        for (Future<?> f : futures) {
            f.get();
        }

        assertNull(firstException.get(), () -> "Concurrency test failed with exception: " + firstException.get());
    }
}
