package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.EventWaitlistRepository;
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
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests covering Issues #2101, #2102, #2104, and #14617 at the HTTP layer.
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
    private EventWaitlistRepository eventWaitlistRepository;

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
        eventWaitlistRepository.deleteAll();
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

        userRepository.save(User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .username("admin")
                .password(passwordEncoder.encode("password"))
                .role(Role.ADMIN)
                .build());
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

    // ── Issue #11230 — Public events only on public read endpoints ───────────

    @Test
    @DisplayName("#11230 — GET /api/events excludes events marked not public")
    void testGetAllEventsExcludesPrivateEvents() throws Exception {
        Event privateEvent = new Event();
        privateEvent.setTitle("Private Event");
        privateEvent.setCapacity(100);
        privateEvent.setEventDate(LocalDateTime.now().plusDays(1));
        privateEvent.setPublic(false);
        privateEvent = eventRepository.save(privateEvent);

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == " + privateEvent.getId() + ")]").isEmpty());
    }

    @Test
    @DisplayName("#11230 — GET /api/events/{id} returns 404 for a non-public event")
    void testGetPublicEventByIdExcludesPrivateEvent() throws Exception {
        Event privateEvent = new Event();
        privateEvent.setTitle("Private Event");
        privateEvent.setCapacity(100);
        privateEvent.setEventDate(LocalDateTime.now().plusDays(1));
        privateEvent.setPublic(false);
        privateEvent = eventRepository.save(privateEvent);

        mockMvc.perform(get("/api/events/" + privateEvent.getId()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/events/" + eventId))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("#12081 — GET /api/events excludes cancelled events")
    void testGetAllEventsExcludesCancelledEvents() throws Exception {
        Event cancelled = new Event();
        cancelled.setTitle("Cancelled Event");
        cancelled.setCapacity(100);
        cancelled.setEventDate(LocalDateTime.now().plusDays(1));
        cancelled.setPublic(true);
        cancelled.setStatus("CANCELLED");
        cancelled = eventRepository.save(cancelled);

        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[?(@.id == " + cancelled.getId() + ")]").isEmpty());
    }

    @Test
    @DisplayName("#12081 — GET /api/events/{id} returns 404 for a cancelled event")
    void testGetPublicEventByIdExcludesCancelledEvent() throws Exception {
        Event cancelled = new Event();
        cancelled.setTitle("Cancelled Event");
        cancelled.setCapacity(100);
        cancelled.setEventDate(LocalDateTime.now().plusDays(1));
        cancelled.setPublic(true);
        cancelled.setStatus("CANCELLED");
        cancelled = eventRepository.save(cancelled);

        mockMvc.perform(get("/api/events/" + cancelled.getId()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/events/" + eventId))
                .andExpect(status().isOk());
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
    @DisplayName("#8600 - registrations are private in attendee directory by default")
    void testAttendeeDirectoryDefaultPrivate() throws Exception {
        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/events/" + eventId + "/attendees")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    @DisplayName("#8600 - opted-in registered attendees appear in attendee directory")
    void testAttendeeDirectoryShowsOptedInProfiles() throws Exception {
        User attendee = userRepository.findByEmail("user1@example.com").orElseThrow();
        attendee.setProfileHeadline("Full Stack Developer looking for a team");
        attendee.setLinkedinUrl("https://www.linkedin.com/in/user1");
        attendee.setGithubUrl("https://github.com/user1");
        userRepository.save(attendee);

        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com"))
                        .contentType(APPLICATION_JSON)
                        .content("{\"showProfileInAttendeeDirectory\":true}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/events/" + eventId + "/attendees")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(attendee.getId()))
                .andExpect(jsonPath("$[0].displayName").value("User1 Test"))
                .andExpect(jsonPath("$[0].username").value("user1"))
                .andExpect(jsonPath("$[0].profileHeadline").value("Full Stack Developer looking for a team"))
                .andExpect(jsonPath("$[0].linkedinUrl").value("https://www.linkedin.com/in/user1"))
                .andExpect(jsonPath("$[0].githubUrl").value("https://github.com/user1"))
                .andExpect(jsonPath("$[0].email").doesNotExist());
    }

    @Test
    @DisplayName("#8600 - unregistered users cannot view attendee directory")
    void testAttendeeDirectoryRequiresRegistration() throws Exception {
        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com"))
                        .contentType(APPLICATION_JSON)
                        .content("{\"showProfileInAttendeeDirectory\":true}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/events/" + eventId + "/attendees")
                        .with(user("user2@example.com")))
                .andExpect(status().isForbidden());
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
    @DisplayName("#11781 — POST /register returns 400 for an event that has already ended")
    void testRegistrationPastEventRejected() throws Exception {
        Event past = new Event();
        past.setTitle("Past Event");
        past.setCapacity(100);
        past.setEventDate(LocalDateTime.now().minusDays(1)); // already ended
        past.setPublic(true);
        past = eventRepository.save(past);

        mockMvc.perform(post("/api/events/" + past.getId() + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Registration is closed for this event."));
    }

    @Test
    @DisplayName("#12080 — POST /register returns 409 for a cancelled event")
    void testRegistrationCancelledEventRejected() throws Exception {
        Event cancelled = new Event();
        cancelled.setTitle("Cancelled Event");
        cancelled.setCapacity(100);
        cancelled.setEventDate(LocalDateTime.now().plusDays(1));
        cancelled.setPublic(true);
        cancelled.setStatus("CANCELLED");
        cancelled = eventRepository.save(cancelled);

        mockMvc.perform(post("/api/events/" + cancelled.getId() + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("This event has been cancelled."));
    }

    @Test
    @DisplayName("#12080 — POST /waitlist returns 409 for a cancelled event")
    void testWaitlistCancelledEventRejected() throws Exception {
        Event cancelled = new Event();
        cancelled.setTitle("Cancelled Event");
        cancelled.setCapacity(1);
        cancelled.setEventDate(LocalDateTime.now().plusDays(1));
        cancelled.setPublic(true);
        cancelled.setStatus("CANCELLED");
        cancelled = eventRepository.save(cancelled);

        mockMvc.perform(post("/api/events/" + cancelled.getId() + "/waitlist")
                        .with(user("user1@example.com")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("This event has been cancelled."));
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

    @Test
    @DisplayName("#9977 - full event allows users to join waitlist and exposes queue position")
    void testJoinWaitlistAndAvailabilityPosition() throws Exception {
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/api/events/" + eventId + "/register")
                            .with(user("user" + i + "@example.com")))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/api/events/" + eventId + "/waitlist")
                        .with(user("user6@example.com")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventId").value(eventId))
                .andExpect(jsonPath("$.userEmail").value("user6@example.com"))
                .andExpect(jsonPath("$.position").value(1))
                .andExpect(jsonPath("$.status").value("WAITING"));

        mockMvc.perform(get("/api/events/" + eventId + "/availability")
                        .with(user("user6@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.full").value(true));
    }

    @Test
    @DisplayName("#9977 - cancellation auto-promotes the first waitlisted user")
    void testCancellationPromotesFirstWaitlistedUser() throws Exception {
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/api/events/" + eventId + "/register")
                            .with(user("user" + i + "@example.com")))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/api/events/" + eventId + "/waitlist")
                        .with(user("user6@example.com")))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/events/" + eventId + "/registration")
                        .with(user("user1@example.com")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/users/my-events")
                        .with(user("user6@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventId").value(eventId))
                .andExpect(jsonPath("$[0].status").value("CONFIRMED"));

        mockMvc.perform(get("/api/notifications")
                        .with(user("user6@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Waitlist spot opened"));
    }

    @Test
    @DisplayName("#9977 - queued user can leave the waitlist")
    void testLeaveWaitlist() throws Exception {
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/api/events/" + eventId + "/register")
                            .with(user("user" + i + "@example.com")))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/api/events/" + eventId + "/waitlist")
                        .with(user("user6@example.com")))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/events/" + eventId + "/waitlist")
                        .with(user("user6@example.com")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/events/" + eventId + "/availability")
                        .with(user("user6@example.com")))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("#9977 - admin can manually promote a waitlisted user when capacity opens")
    void testAdminManualPromotion() throws Exception {
        Event event = eventRepository.findById(eventId).orElseThrow();
        event.setCapacity(1);
        eventRepository.save(event);

        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk());

        String response = mockMvc.perform(post("/api/events/" + eventId + "/waitlist")
                        .with(user("user2@example.com")))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        Long waitlistId = Long.valueOf(response.replaceAll(".*\"id\":(\\d+).*", "$1"));

        event = eventRepository.findById(eventId).orElseThrow();
        event.setCapacity(2);
        eventRepository.save(event);

        mockMvc.perform(post("/api/events/" + eventId + "/waitlist/" + waitlistId + "/promote")
                        .with(user("admin@example.com").authorities(() -> "ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userEmail").value("user2@example.com"))
                .andExpect(jsonPath("$.registrationStatus").value("CONFIRMED"));
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

    // ── Issue #14617 — Maintenance writes succeed on private events ──────────

    @Test
    @DisplayName("#14617 - cancelling a registration on a private event succeeds")
    void testCancelRegistrationOnPrivateEvent() throws Exception {
        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .with(user("user1@example.com")))
                .andExpect(status().isOk());

        Event event = eventRepository.findById(eventId).orElseThrow();
        event.setPublic(false);
        eventRepository.save(event);

        mockMvc.perform(delete("/api/events/" + eventId + "/registration")
                        .with(user("user1@example.com")))
                .andExpect(status().isNoContent());

        assertTrue(eventRegistrationRepository
                .findByEvent_IdAndUser_Email(eventId, "user1@example.com").isEmpty(),
                "registration should be deleted even though the event is private");
    }

    @Test
    @DisplayName("#14617 - waitlist promotion commits on a private event")
    void testWaitlistPromotionOnPrivateEvent() throws Exception {
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/api/events/" + eventId + "/register")
                            .with(user("user" + i + "@example.com")))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(post("/api/events/" + eventId + "/waitlist")
                        .with(user("user6@example.com")))
                .andExpect(status().isCreated());

        Event event = eventRepository.findById(eventId).orElseThrow();
        event.setPublic(false);
        eventRepository.save(event);

        mockMvc.perform(delete("/api/events/" + eventId + "/registration")
                        .with(user("user1@example.com")))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/users/my-events")
                        .with(user("user6@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventId").value(eventId))
                .andExpect(jsonPath("$[0].status").value("CONFIRMED"));
    }
}
