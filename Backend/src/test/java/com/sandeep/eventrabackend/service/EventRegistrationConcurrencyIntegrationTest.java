package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.exception.EventFullException;
import com.sandeep.eventrabackend.exception.RegistrationConflictException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Service-level concurrency integration tests for Issue #2104.
 *
 * <p>These tests call {@link EventService} directly (bypassing HTTP), making it
 * easier to count successes and failures precisely without HTTP status parsing.
 *
 * <p>Uses the H2 in-memory database via the "test" Spring profile.
 */
@SpringBootTest
@ActiveProfiles("test")
class EventRegistrationConcurrencyIntegrationTest {

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();
    }

    // ── Issue #2104: core overbooking prevention ──────────────────────────────

    @Test
    @DisplayName("#2104 — Only 1 registration succeeds when 20 threads race for capacity=1")
    void shouldPreventConcurrentOverbookingWhenCapacityIsOne() throws InterruptedException {
        int threads = 20;

        List<String> emails = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            String email = "testuser" + i + "@test.com";
            userRepository.save(User.builder()
                    .firstName("Test")
                    .lastName("User" + i)
                    .email(email)
                    .username("testuser" + i)
                    .password(passwordEncoder.encode("password"))
                    .role(Role.CLIENT)
                    .build());
            emails.add(email);
        }

        Event event = createEventWithCapacity(1);

        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threads);

        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failureCount = new AtomicInteger();
        AtomicInteger unexpectedCount = new AtomicInteger();

        for (int i = 0; i < threads; i++) {
            final String email = emails.get(i);
            executor.submit(() -> {
                try {
                    ready.countDown();
                    start.await();
                    eventService.registerUserForEvent(event.getId(), email);
                    successCount.incrementAndGet();
                } catch (EventFullException | RegistrationConflictException ex) {
                    // Expected: event full or optimistic-lock retry exhausted
                    failureCount.incrementAndGet();
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                } catch (Exception ex) {
                    // Unexpected — flag for assertion
                    unexpectedCount.incrementAndGet();
                } finally {
                    done.countDown();
                }
            });
        }

        ready.await();
        start.countDown();
        done.await();
        executor.shutdown();

        // Exactly 1 registration must have been committed
        Event updated = eventRepository.findById(event.getId()).orElseThrow();
        assertEquals(1, updated.getRegisteredCount(),
                "registeredCount in DB should be exactly 1 — no overbooking");
        assertEquals(1, successCount.get(),
                "Exactly 1 thread should have succeeded");
        assertEquals(threads - 1, failureCount.get(),
                "All other threads should have received EventFullException or RegistrationConflictException");
        assertEquals(0, unexpectedCount.get(),
                "No thread should have encountered an unexpected exception");
    }

    @Test
    @DisplayName("#2104 — Exactly capacity registrations succeed when threads = 2×capacity")
    void shouldAllowExactlyCapacityRegistrations() throws InterruptedException {
        int capacity = 5;
        int threads = capacity * 2;   // 10 threads competing for 5 spots

        List<String> emails = new ArrayList<>();
        for (int i = 0; i < threads; i++) {
            String email = "multiuser" + i + "@test.com";
            userRepository.save(User.builder()
                    .firstName("Multi")
                    .lastName("User" + i)
                    .email(email)
                    .username("multiuser" + i)
                    .password(passwordEncoder.encode("password"))
                    .role(Role.CLIENT)
                    .build());
            emails.add(email);
        }

        Event event = createEventWithCapacity(capacity);

        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(threads);

        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failureCount = new AtomicInteger();

        for (int i = 0; i < threads; i++) {
            final String email = emails.get(i);
            executor.submit(() -> {
                try {
                    ready.countDown();
                    start.await();
                    eventService.registerUserForEvent(event.getId(), email);
                    successCount.incrementAndGet();
                } catch (EventFullException | RegistrationConflictException ex) {
                    failureCount.incrementAndGet();
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

        Event updated = eventRepository.findById(event.getId()).orElseThrow();

        // Capacity must never be exceeded
        assertTrue(updated.getRegisteredCount() <= capacity,
                "registeredCount " + updated.getRegisteredCount() + " exceeded capacity " + capacity);
        assertTrue(successCount.get() <= capacity,
                "Success count " + successCount.get() + " exceeded capacity " + capacity);

        // All threads accounted for
        assertEquals(threads, successCount.get() + failureCount.get());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Event createEventWithCapacity(int capacity) {
        Event event = new Event();
        event.setTitle("Concurrency Test Event");
        event.setDescription("Testing pessimistic lock + optimistic version for registrations");
        event.setLocation("Online");
        event.setEventDate(LocalDateTime.now().plusDays(1));
        event.setPublic(true);
        event.setCapacity(capacity);
        event.setRegisteredCount(0);
        return eventRepository.saveAndFlush(event);
    }
}
