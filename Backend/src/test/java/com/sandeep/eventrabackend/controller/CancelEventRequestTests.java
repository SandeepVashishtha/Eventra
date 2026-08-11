package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventWaitlist;
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
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Map;

import static org.hamcrest.Matchers.hasItem;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #12070 — the backend failed to compile because the cancel endpoint
 * referenced a missing {@code CancelEventRequest} DTO. This test pins the
 * end-to-end cancel flow so a missing/renamed DTO breaks the build again.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CancelEventRequestTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EventWaitlistRepository eventWaitlistRepository;

    private Event existingEvent;

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
        event.setTitle("Event to cancel");
        event.setDescription("Description");
        event.setLocation("Location");
        event.setEventDate(LocalDateTime.now().plusDays(5));
        event.setCapacity(100);
        event.setPublic(true);
        existingEvent = eventRepository.save(event);
    }

    @Test
    @DisplayName("POST /api/events/{id}/cancel accepts a valid CancelEventRequest body")
    void cancelEvent_WithValidRequest_Succeeds() throws Exception {
        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("reason", "Venue unavailable", "refundPolicy", "FULL"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(existingEvent.getId()))
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.refundPolicy").value("FULL"));
    }

    @Test
    @DisplayName("POST /api/events/{id}/cancel with a missing refund policy returns 400")
    void cancelEvent_WithoutRefundPolicy_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "Venue unavailable"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Cancel notifies WAITING waitlist users and clears their entries")
    void cancelEvent_NotifiesWaitlistedUsers() throws Exception {
        User waitlisted = userRepository.save(User.builder()
                .firstName("Wait")
                .lastName("Lister")
                .email("waitlist@example.com")
                .username("waitlist")
                .password(passwordEncoder.encode("password"))
                .role(Role.ATTENDEE)
                .build());

        EventWaitlist entry = new EventWaitlist();
        entry.setEvent(existingEvent);
        entry.setUser(waitlisted);
        entry.setPosition(1);
        entry.setStatus("WAITING");
        eventWaitlistRepository.save(entry);

        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("reason", "Venue unavailable", "refundPolicy", "NONE", "notifyAttendees", true))))
                .andExpect(status().isOk());

        assertEquals("CANCELLED",
                eventWaitlistRepository.findById(entry.getId()).orElseThrow().getStatus());
        assertEquals(1, notificationRepository.findAll().stream()
                .filter(n -> n.getUser().getEmail().equals("waitlist@example.com"))
                .filter(n -> "Event cancelled".equals(n.getTitle()))
                .count());

        mockMvc.perform(get("/api/events/" + existingEvent.getId() + "/notified-attendees")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasItem("waitlist@example.com")));
    }
}
