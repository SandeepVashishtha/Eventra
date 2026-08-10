package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #12610 — {@code GET /api/admin/stats} must return the compact dashboard
 * stats rendered by {@code AdminDashboard.js}: totalUsers, activeUsers,
 * totalEvents, upcoming, and totalParticipants.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminStatsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        hackathonRegistrationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
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
    }

    private User createClient(String email) {
        return userRepository.save(User.builder()
                .firstName("Test")
                .lastName("User")
                .email(email)
                .username(email.split("@")[0])
                .password(passwordEncoder.encode("secret"))
                .role(Role.CLIENT)
                .build());
    }

    private Event createEvent(LocalDateTime eventDate) {
        Event event = new Event();
        event.setTitle("Stats Test Event");
        event.setDescription("Description");
        event.setLocation("Location");
        event.setEventDate(eventDate);
        event.setCapacity(100);
        event.setPublic(true);
        return eventRepository.save(event);
    }

    private void register(User attendee, Event event) {
        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(attendee);
        eventRegistrationRepository.save(registration);
    }

    @Test
    @DisplayName("Returns total users, events, upcoming events, and participant counts")
    void getStats_ReturnsDashboardCounts() throws Exception {
        User alice = createClient("alice@example.com");
        User bob = createClient("bob@example.com");
        createClient("carol@example.com");

        Event upcomingEvent = createEvent(LocalDateTime.now().plusDays(7));
        Event pastEvent = createEvent(LocalDateTime.now().minusDays(7));

        register(alice, upcomingEvent);
        register(bob, upcomingEvent);
        register(alice, pastEvent);

        mockMvc.perform(get("/api/admin/stats")
                        .with(user("admin@example.com")
                                .authorities(new SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(4))
                .andExpect(jsonPath("$.activeUsers").value(2))
                .andExpect(jsonPath("$.totalEvents").value(2))
                .andExpect(jsonPath("$.upcoming").value(1))
                .andExpect(jsonPath("$.totalParticipants").value(3));
    }

    @Test
    @DisplayName("Returns zeroed stats when the database is empty")
    void getStats_EmptyDatabase() throws Exception {
        mockMvc.perform(get("/api/admin/stats")
                        .with(user("admin@example.com")
                                .authorities(new SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(1))
                .andExpect(jsonPath("$.activeUsers").value(0))
                .andExpect(jsonPath("$.totalEvents").value(0))
                .andExpect(jsonPath("$.upcoming").value(0))
                .andExpect(jsonPath("$.totalParticipants").value(0));
    }

    @Test
    @DisplayName("Rejects non-admin users with 403")
    void getStats_ForbiddenForNonAdmin() throws Exception {
        createClient("client@example.com");

        mockMvc.perform(get("/api/admin/stats")
                        .with(user("client@example.com")
                                .authorities(new SimpleGrantedAuthority("CLIENT"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Rejects unauthenticated requests with 401")
    void getStats_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isUnauthorized());
    }
}
