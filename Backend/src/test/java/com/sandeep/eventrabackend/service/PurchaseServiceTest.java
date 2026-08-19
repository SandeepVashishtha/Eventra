package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.repository.TicketTierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Regression tests for Issue #17833: ticket capacity must be enforced against a
 * shared, durable store so concurrent purchases across instances (and restarts)
 * can never oversell.
 */
@SpringBootTest
@ActiveProfiles("test")
class PurchaseServiceTest {

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private TicketTierRepository ticketTierRepository;

    @BeforeEach
    void setUp() {
        ticketTierRepository.deleteAll();
        purchaseService.seedTiersIfAbsent();
    }

    @Test
    @DisplayName("#17833 — successful purchase decrements the shared tier capacity")
    void purchaseDecrementsRemainingCapacity() {
        assertTrue(purchaseService.purchaseTicket("VIP", 10));
        assertEquals(190, purchaseService.getRemainingCapacity());
        assertEquals(40, ticketTierRepository.findByTier("VIP").orElseThrow().getRemaining());
    }

    @Test
    @DisplayName("#17833 — purchase is rejected once the tier is exhausted")
    void purchaseFailsWhenTierExhausted() {
        assertTrue(purchaseService.purchaseTicket("VIP", 50));
        assertFalse(purchaseService.purchaseTicket("VIP", 1));
        assertEquals(150, purchaseService.getRemainingCapacity());
    }

    @Test
    @DisplayName("#17833 — purchase is rejected when it exceeds total event capacity")
    void purchaseFailsWhenEventCapacityExceeded() {
        assertTrue(purchaseService.purchaseTicket("VIP", 50));
        assertTrue(purchaseService.purchaseTicket("GENERAL", 150));
        assertEquals(0, purchaseService.getRemainingCapacity());
        assertFalse(purchaseService.purchaseTicket("GENERAL", 1));
    }

    @Test
    @DisplayName("#17833 — non-positive quantities and unknown tiers are rejected")
    void purchaseRejectsInvalidArguments() {
        assertFalse(purchaseService.purchaseTicket("VIP", 0));
        assertFalse(purchaseService.purchaseTicket("VIP", -3));
        assertFalse(purchaseService.purchaseTicket("GOLD", 1));
        assertEquals(200, purchaseService.getRemainingCapacity());
    }

    @Test
    @DisplayName("#17833 — capacity is shared across service instances (no per-JVM counters)")
    void capacityIsSharedAcrossServiceInstances() {
        PurchaseService otherInstance = new PurchaseService(ticketTierRepository);

        assertTrue(purchaseService.purchaseTicket("VIP", 30));
        assertEquals(30, ticketTierRepository.findByTier("VIP").orElseThrow().getRemaining());

        assertFalse(otherInstance.purchaseTicket("VIP", 30), "other instance must not oversell the shared tier");
        assertTrue(otherInstance.purchaseTicket("VIP", 20));
        assertEquals(0, otherInstance.getRemainingCapacity());

        assertTrue(purchaseService.purchaseTicket("GENERAL", 150));
        assertFalse(otherInstance.purchaseTicket("GENERAL", 1));
    }

    @Test
    @DisplayName("#17833 — concurrent purchases across threads never oversell")
    void concurrentPurchasesNeverOversell() throws InterruptedException {
        int capacity = 50;
        int threads = 100;

        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threads);

        AtomicInteger successCount = new AtomicInteger();

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    if (purchaseService.purchaseTicket("VIP", 1)) {
                        successCount.incrementAndGet();
                    }
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                } finally {
                    done.countDown();
                }
            });
        }

        ready.await();
        start.countDown();
        done.await();
        executor.shutdown();

        assertEquals(capacity, successCount.get());
        assertEquals(150, purchaseService.getRemainingCapacity());
        assertEquals(0, ticketTierRepository.findByTier("VIP").orElseThrow().getRemaining());
    }
}
