package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AnalyticsSummaryTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        User admin = User.builder()
                .firstName("Ada")
                .lastName("Admin")
                .email("admin@example.com")
                .username("adaadmin")
                .password(passwordEncoder.encode("password"))
                .role(Role.SUPER_ADMIN)
                .build();
        userRepository.save(admin);

        User attendee = User.builder()
                .firstName("Sam")
                .lastName("Attendee")
                .email("sam@example.com")
                .username("samattendee")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(attendee);

        Event event = new Event();
        event.setTitle("Tech Conference 2026");
        event.setDescription("A deep dive into AI and Cloud computing.");
        event.setLocation("San Francisco, CA");
        event.setEventDate(LocalDateTime.now().plusDays(10));
        event.setRegisteredCount(1);
        eventRepository.save(event);

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(attendee);
        registration.setStatus("CONFIRMED");
        eventRegistrationRepository.save(registration);
    }

    @Test
    @DisplayName("GET /api/analytics/summary - returns aggregate plus category breakdown")
    void testSummaryReturnsAggregateAndBreakdown() throws Exception {
        mockMvc.perform(get("/api/analytics/summary")
                        .with(user("admin@example.com").authorities(() -> "SUPER_ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stats.totalEvents").value(1))
                .andExpect(jsonPath("$.stats.totalRegistrations").value(1))
                .andExpect(jsonPath("$.categoryBreakdown[0].name").value("Tech Conference 2026"))
                .andExpect(jsonPath("$.categoryBreakdown[0].value").value(1))
                .andExpect(jsonPath("$.categoryBreakdown[0].color").isNotEmpty())
                .andExpect(jsonPath("$.hoursActive").isNotEmpty())
                .andExpect(jsonPath("$.activeAlerts").value(0));
    }

    @Test
    @DisplayName("GET /api/analytics/summary - Unauthorized without authentication")
    void testSummary_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/analytics/summary"))
                .andExpect(status().isUnauthorized());
    }
}
