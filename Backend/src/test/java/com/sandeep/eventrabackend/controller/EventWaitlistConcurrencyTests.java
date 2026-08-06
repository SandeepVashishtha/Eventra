package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.EventWaitlistRepository;
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
    private EventRepository eventRepository;

    @Autowired
    private EventWaitlistRepository eventWaitlistRepository;

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
}
