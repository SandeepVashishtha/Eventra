package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.SignupRequest;
import com.sandeep.eventrabackend.exception.UserAlreadyExistsException;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Service-level concurrency tests for signup (#18843).
 *
 * <p>Two requests with the same email racing through the "does this email
 * exist?" check both pass, so the loser hits the unique-email constraint during
 * persist. That violation must surface as {@link UserAlreadyExistsException}
 * (409) — not an unhandled constraint exception (500).
 */
@SpringBootTest
@ActiveProfiles("test")
class SignupConcurrencyIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("concurrent signups with the same email yield exactly one success and one conflict (#18843)")
    void concurrentDuplicateEmailSignups() throws Exception {
        int threads = 2;
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch go = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        AtomicInteger success = new AtomicInteger();
        AtomicInteger conflict = new AtomicInteger();
        AtomicInteger unexpected = new AtomicInteger();

        SignupRequest request = new SignupRequest();
        request.setFirstName("Concurrent");
        request.setLastName("User");
        request.setEmail("race@example.com");
        request.setPassword("password123");
        request.setConfirmPassword("password123");

        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                ready.countDown();
                try {
                    go.await(10, TimeUnit.SECONDS);
                    authService.signup(request);
                    success.incrementAndGet();
                } catch (UserAlreadyExistsException e) {
                    conflict.incrementAndGet();
                } catch (Exception e) {
                    unexpected.incrementAndGet();
                }
            });
        }

        assertTrue(ready.await(10, TimeUnit.SECONDS), "signup threads did not start");
        go.countDown();
        pool.shutdown();
        assertTrue(pool.awaitTermination(30, TimeUnit.SECONDS), "signup threads did not finish");

        assertEquals(1, success.get(), "exactly one signup should win");
        assertEquals(1, conflict.get(), "the loser must be reported as a clean 409 conflict");
        assertEquals(0, unexpected.get(), "no other exception type may escape");
        assertEquals(1, userRepository.count(), "only one user row should exist");
    }
}
