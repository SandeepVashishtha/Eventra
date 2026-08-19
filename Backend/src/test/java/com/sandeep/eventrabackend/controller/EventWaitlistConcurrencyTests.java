package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventWaitlist;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.EventWaitlistRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.dto.request.CsvWaitlistImportRequest;
import com.sandeep.eventrabackend.dto.response.RegistrationResponse;
import com.sandeep.eventrabackend.exception.EventFullException;
import com.sandeep.eventrabackend.service.EventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventWaitlistConcurrencyTests {

    private static final int JOINERS = 6;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventWaitlistRepository eventWaitlistRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private NotificationRepository notificationRepository;

    private Long eventId;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventWaitlistRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        userRepository.save(User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .username("admin")
                .password(passwordEncoder.encode("password"))
                .role(Role.ADMIN)
                .build());

        Event event = new Event();
        event.setTitle("Concurrent waitlist");
        event.setDescription("Description");
        event.setLocation("Location");
        event.setEventDate(LocalDateTime.now().plusDays(5));
        event.setCapacity(1);
        event.setRegisteredCount(1);
        event.setPublic(true);
        eventId = eventRepository.save(event).getId();
    }

    @Test
    @DisplayName("Concurrent waitlist joins produce distinct sequential positions")
    void concurrentJoinWaitlist_ProducesDistinctPositions() throws Exception {
        for (int i = 1; i <= JOINERS; i++) {
            userRepository.save(User.builder()
                    .firstName("Client")
                    .lastName(String.valueOf(i))
                    .email("client" + i + "@example.com")
                    .username("client" + i)
                    .password(passwordEncoder.encode("password"))
                    .role(Role.CLIENT)
                    .build());
        }

        ExecutorService pool = Executors.newFixedThreadPool(JOINERS);
        List<Future<Integer>> futures = new ArrayList<>();
        for (int i = 1; i <= JOINERS; i++) {
            final String email = "client" + i + "@example.com";
            futures.add(pool.submit(() -> {
                MvcResult result = mockMvc.perform(post("/api/events/" + eventId + "/waitlist")
                                .with(user(email)))
                        .andReturn();
                assertEquals(201, result.getResponse().getStatus(),
                        "waitlist join failed for " + email);
                String body = result.getResponse().getContentAsString();
                return Integer.parseInt(body.replaceAll(".*\"position\":(\\d+).*", "$1"));
            }));
        }
        pool.shutdown();
        assertTrue(pool.awaitTermination(30, TimeUnit.SECONDS),
                "waitlist joins did not finish in time");

        Set<Integer> positions = new HashSet<>();
        for (Future<Integer> future : futures) {
            positions.add(future.get(5, TimeUnit.SECONDS));
        }

        assertEquals(JOINERS, positions.size(),
                "concurrent joins must produce distinct positions, got " + positions);
        for (int p = 1; p <= JOINERS; p++) {
            assertTrue(positions.contains(p),
                    "expected position " + p + " to be assigned, got " + positions);
        }

        assertEquals(JOINERS, eventWaitlistRepository.count(),
                "all joins should be persisted");
    }

    @Test
    @DisplayName("Concurrent legacy import and waitlist joins produce gap-free distinct positions without dropping members")
    void concurrentImportAndJoinWaitlist_NoMembersDropped() throws Exception {
        int legacyCount = 5;
        int liveJoinersCount = 5;

        // Create users for legacy import
        List<CsvWaitlistImportRequest.CsvWaitlistEntry> csvEntries = new ArrayList<>();
        for (int i = 1; i <= legacyCount; i++) {
            String email = "legacy" + i + "@example.com";
            userRepository.save(User.builder()
                    .firstName("Legacy")
                    .lastName(String.valueOf(i))
                    .email(email)
                    .username("legacy" + i)
                    .password(passwordEncoder.encode("password"))
                    .role(Role.CLIENT)
                    .build());
            csvEntries.add(new CsvWaitlistImportRequest.CsvWaitlistEntry(
                    "Legacy User " + i, email, "2024-01-0" + i + "T10:00:00Z"));
        }

        // Create users for live joiners
        for (int i = 1; i <= liveJoinersCount; i++) {
            String email = "livejoiner" + i + "@example.com";
            userRepository.save(User.builder()
                    .firstName("Live")
                    .lastName(String.valueOf(i))
                    .email(email)
                    .username("livejoiner" + i)
                    .password(passwordEncoder.encode("password"))
                    .role(Role.CLIENT)
                    .build());
        }

        ExecutorService pool = Executors.newFixedThreadPool(liveJoinersCount + 1);
        List<Future<Void>> futures = new ArrayList<>();

        // Submit legacy import task
        futures.add(pool.submit(() -> {
            CsvWaitlistImportRequest request = new CsvWaitlistImportRequest(eventId, csvEntries);
            var response = eventService.importLegacyWaitlist(request, "admin@example.com");
            assertEquals(legacyCount, response.getSuccessfulImports(), "All legacy entries must be imported successfully");
            assertEquals(0, response.getFailedImports(), "No legacy entries should fail");
            return null;
        }));

        // Submit live waitlist join tasks concurrently
        for (int i = 1; i <= liveJoinersCount; i++) {
            final String email = "livejoiner" + i + "@example.com";
            futures.add(pool.submit(() -> {
                MvcResult result = mockMvc.perform(post("/api/events/" + eventId + "/waitlist")
                                .with(user(email)))
                        .andReturn();
                assertEquals(201, result.getResponse().getStatus(), "Waitlist join failed for " + email);
                return null;
            }));
        }

        pool.shutdown();
        assertTrue(pool.awaitTermination(30, TimeUnit.SECONDS), "Concurrent tasks did not finish in time");

        for (Future<Void> future : futures) {
            future.get(5, TimeUnit.SECONDS);
        }

        int totalExpected = legacyCount + liveJoinersCount;
        assertEquals(totalExpected, eventWaitlistRepository.count(), "All legacy and live members should be persisted");

        var allEntries = eventWaitlistRepository.findByEvent_IdAndStatusOrderByPositionAscJoinedAtAsc(eventId, "WAITING");
        assertEquals(totalExpected, allEntries.size());

        Set<Integer> positions = new HashSet<>();
        for (int p = 0; p < allEntries.size(); p++) {
            int position = allEntries.get(p).getPosition();
            positions.add(position);
        }

        assertEquals(totalExpected, positions.size(), "Positions must all be distinct");
        for (int p = 1; p <= totalExpected; p++) {
            assertTrue(positions.contains(p), "Expected position " + p + " to exist");
        }
    }

    @Test
    @DisplayName("Manual waitlist promotion consumes a seat; a second promotion past capacity throws EventFullException")
    void manualPromotionConsumesSeat_SecondPromotionPastCapacityThrows() {
        Event capacityEvent = new Event();
        capacityEvent.setTitle("Manual promotion capacity");
        capacityEvent.setDescription("Description");
        capacityEvent.setLocation("Location");
        capacityEvent.setEventDate(LocalDateTime.now().plusDays(5));
        capacityEvent.setCapacity(1);
        capacityEvent.setRegisteredCount(0);
        capacityEvent.setPublic(true);
        Long capacityEventId = eventRepository.save(capacityEvent).getId();

        userRepository.save(User.builder()
                .firstName("Waiting")
                .lastName("One")
                .email("waiting1@example.com")
                .username("waiting1")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());
        userRepository.save(User.builder()
                .firstName("Waiting")
                .lastName("Two")
                .email("waiting2@example.com")
                .username("waiting2")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        Event persistedEvent = eventRepository.findById(capacityEventId).orElseThrow();

        EventWaitlist first = new EventWaitlist();
        first.setEvent(persistedEvent);
        first.setUser(userRepository.findByEmail("waiting1@example.com").orElseThrow());
        first.setPosition(1);
        first.setStatus(EventWaitlist.STATUS_WAITING);
        EventWaitlist savedFirst = eventWaitlistRepository.save(first);

        EventWaitlist second = new EventWaitlist();
        second.setEvent(persistedEvent);
        second.setUser(userRepository.findByEmail("waiting2@example.com").orElseThrow());
        second.setPosition(2);
        second.setStatus(EventWaitlist.STATUS_WAITING);
        EventWaitlist savedSecond = eventWaitlistRepository.save(second);

        RegistrationResponse firstResponse = eventService.promoteWaitlistedUser(
                capacityEventId, savedFirst.getId(), "admin@example.com");
        assertEquals("CONFIRMED", firstResponse.getRegistrationStatus());

        assertEquals(1, eventRepository.findById(capacityEventId).orElseThrow().getRegisteredCount(),
                "first manual promotion must consume the only seat");

        assertThrows(EventFullException.class, () -> eventService.promoteWaitlistedUser(
                capacityEventId, savedSecond.getId(), "admin@example.com"));
    }
}
