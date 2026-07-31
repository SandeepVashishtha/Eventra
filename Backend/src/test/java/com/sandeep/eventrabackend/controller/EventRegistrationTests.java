package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests covering Issues #2101, #2102, and #2104 at the HTTP layer.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EventRegistrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long eventId;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        Event event = new Event();
        event.setTitle("Test Event");
        event.setCapacity(5);
        event.setEventDate(LocalDateTime.now().plusDays(1));
        event.setPublic(true);
        event = eventRepository.save(event);
        eventId = event.getId();

        // Create 10 test users
        for (int i = 1; i <= 10; i++) {
            User u = User.builder()
                    .firstName("User" + i)
                    .lastName("Test")
                    .email("user" + i + "@example.com")
                    .username("user" + i)
                    .password(passwordEncoder.encode("password"))
                    .role(Role.CLIENT)
                    .build();
            userRepository.save(u);
        }
    }

    // ── Issue #2101 — Availability endpoint ──────────────────────────────────

    @Test
    @DisplayName("#2101 — GET /availability returns correct JSON for a future event")
    void testAvailabilityEndpoint() throws Exception {
        // Availability is now public — no auth needed
        mockMvc.perform(get("/api/events/" + eventId + "/availability"))
                .andExpect(status().isOk())
                // Primary fields
                .andExpect(jsonPath("$.capacity").value(5))
                .andExpect(jsonPath("$.registeredCount").value(0))
                .andExpect(jsonPath("$.spotsLeft").value(5))
                .andExpect(jsonPath("$.full").value(false))
                .andExpect(jsonPath("$.eventPassed").value(false))
                // Alias fields (issue #2101 spec names)
                .andExpect(jsonPath("$.maxAttendees").value(5))
                .andExpect(jsonPath("$.currentAttendees").value(0))
                .andExpect(jsonPath("$.availabilityStatus").value("AVAILABLE"));
    }

    @Test
    @DisplayName("#2101 — GET /availability returns 404 for non-existent event")
    void testAvailabilityNotFound() throws Exception {
        mockMvc.perform(get("/api/events/99999/availability"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("#2101 — GET /availability shows PAST status for past events")
    void testAvailabilityPastEvent() throws Exception {
        Event past = new Event();
        past.setTitle("Past Event");
        past.setCapacity(100);
        past.setEventDate(LocalDateTime.now().minusDays(1));   // in the past
        past.setPublic(true);
        past = eventRepository.save(past);

        mockMvc.perform(get("/api/events/" + past.getId() + "/availability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventPassed").value(true))
                .andExpect(jsonPath("$.availabilityStatus").value("PAST"));
    }

    // ── Issue #2102 — Registration endpoint ──────────────────────────────────

    @Test
    @DisplayName("#2102 — POST /register succeeds for an authenticated user")
    void testRegistrationSuccess() throws Exception {
        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventId").value(eventId))
                .andExpect(jsonPath("$.userEmail").value("user1@example.com"))
                .andExpect(jsonPath("$.registrationStatus").value("CONFIRMED"))
                .andExpect(jsonPath("$.spotsRemaining").value(4));
    }

    @Test
    @DisplayName("#2105 - GET /api/users/my-events returns the authenticated user's registrations")
    void testGetMyRegisteredEvents() throws Exception {
        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.registeredAt").exists());

        mockMvc.perform(get("/api/users/my-events")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventId").value(eventId))
                .andExpect(jsonPath("$[0].title").value("Test Event"))
                .andExpect(jsonPath("$[0].eventDate").exists())
                .andExpect(jsonPath("$[0].date").exists())
                .andExpect(jsonPath("$[0].time").exists())
                .andExpect(jsonPath("$[0].status").value("CONFIRMED"))
                .andExpect(jsonPath("$[0].registeredAt").exists());
    }

    @Test
    @DisplayName("#2105 - GET /api/users/my-events does not leak another user's registrations")
    void testGetMyRegisteredEventsUserIsolation() throws Exception {
        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/users/my-events")
                        .with(user("user2@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @DisplayName("#2105 - GET /api/users/my-events returns all registrations for the authenticated user")
    void testGetMyRegisteredEventsMultipleRegistrations() throws Exception {
        Event secondEvent = new Event();
        secondEvent.setTitle("Second Test Event");
        secondEvent.setDescription("Another event for the same user");
        secondEvent.setLocation("Online");
        secondEvent.setCapacity(10);
        secondEvent.setEventDate(LocalDateTime.now().plusDays(2));
        secondEvent.setPublic(true);
        secondEvent = eventRepository.save(secondEvent);

        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/events/" + secondEvent.getId() + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/users/my-events")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].eventId", containsInAnyOrder(
                        eventId.intValue(),
                        secondEvent.getId().intValue()
                )));
    }

    @Test
    @DisplayName("#2105 - GET /api/users/my-events returns an empty list when the user has no registrations")
    void testGetMyRegisteredEventsEmpty() throws Exception {
        mockMvc.perform(get("/api/users/my-events")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @DisplayName("#2105 - GET /api/users/my-events returns 401 when no JWT is provided")
    void testGetMyRegisteredEventsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/users/my-events"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("#2105 - GET /api/users/my-events returns 404 when the authenticated principal is not a stored user")
    void testGetMyRegisteredEventsUnknownUser() throws Exception {
        mockMvc.perform(get("/api/users/my-events")
                        .with(user("missing@example.com")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found with email: missing@example.com"));
    }

    @Test
    @DisplayName("#2102 — POST /register returns 401 when no JWT is provided")
    void testRegistrationUnauthorized() throws Exception {
        mockMvc.perform(post("/api/events/" + eventId + "/register"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("#2102 — POST /register returns 409 when user is already registered")
    void testDuplicateRegistration() throws Exception {
        // First registration — should succeed
        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk());

        // Second registration — should return 409
        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("You are already registered for this event."));
    }

    @Test
    @DisplayName("#2102 — POST /register returns 404 for non-existent event")
    void testRegistrationEventNotFound() throws Exception {
        mockMvc.perform(post("/api/events/99999/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("#2102 — POST /register returns 409 when event is full")
    void testRegistrationEventFull() throws Exception {
        // Fill the event (capacity = 5) with users 1..5
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/api/events/" + eventId + "/register")
                            .with(user("user" + i + "@example.com")))
                    .andExpect(status().isOk());
        }

        // 6th user should be rejected
        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user6@example.com")))
                .andExpect(status().isConflict());
    }

    // ── Issue #2104 — Concurrent registration ────────────────────────────────

    @Test
    @DisplayName("#2104 — Concurrent registrations never exceed capacity")
    void testConcurrentRegistration() throws InterruptedException {
        int threadCount = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        AtomicInteger otherCount = new AtomicInteger(0);

        for (int i = 1; i <= threadCount; i++) {
            final String email = "user" + i + "@example.com";
            executorService.execute(() -> {
                try {
                    startLatch.await();
                    int status = mockMvc.perform(post("/api/events/" + eventId + "/register")
                                    .with(user(email)))
                            .andReturn().getResponse().getStatus();

                    if (status == 200) {
                        successCount.incrementAndGet();
                    } else if (status == 409) {
                        conflictCount.incrementAndGet();
                    } else {
                        otherCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        finishLatch.await();
        executorService.shutdown();

        // Core invariant: success count must never exceed the capacity (5)
        assertTrue(successCount.get() <= 5,
                "Success count " + successCount.get() + " exceeded capacity 5");

        // All requests must have been handled (200 or 409) — no unexpected errors
        assertEquals(0, otherCount.get(),
                "Some requests returned unexpected status codes");

        // Success + conflict must account for all threads
        assertEquals(threadCount, successCount.get() + conflictCount.get(),
                "Not all requests were accounted for");

        // Verify persisted count matches success count
        Event event = eventRepository.findById(eventId).orElseThrow();
        assertEquals(successCount.get(), event.getRegisteredCount(),
                "Persisted registeredCount does not match successful HTTP responses");
    }
}
