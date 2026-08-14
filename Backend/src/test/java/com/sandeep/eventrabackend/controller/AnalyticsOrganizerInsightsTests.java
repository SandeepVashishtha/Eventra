package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.FeedbackAnalyticsRepository;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression tests for the admin organizer-insights aggregation. The insights
 * must be computed by a single grouped query instead of a per-organizer N+1
 * loop (findById + findAccessibleToUser per owner) (#17834).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AnalyticsOrganizerInsightsTests {

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
    private FeedbackAnalyticsRepository feedbackRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        feedbackRepository.deleteAll();
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

        User alice = User.builder()
                .firstName("Alice")
                .lastName("Organizer")
                .email("alice@example.com")
                .username("aliceorg")
                .password(passwordEncoder.encode("password"))
                .role(Role.ORGANIZER)
                .build();
        userRepository.save(alice);

        User bob = User.builder()
                .firstName("Bob")
                .lastName("Organizer")
                .email("bob@example.com")
                .username("boborg")
                .password(passwordEncoder.encode("password"))
                .role(Role.ORGANIZER)
                .build();
        userRepository.save(bob);

        Event aliceEventOne = new Event();
        aliceEventOne.setOwnerId(alice.getId());
        aliceEventOne.setRegisteredCount(50);
        aliceEventOne.setCapacity(100);
        eventRepository.save(aliceEventOne);

        Event aliceEventTwo = new Event();
        aliceEventTwo.setOwnerId(alice.getId());
        aliceEventTwo.setRegisteredCount(30);
        aliceEventTwo.setCapacity(60);
        eventRepository.save(aliceEventTwo);

        Event bobEvent = new Event();
        bobEvent.setOwnerId(bob.getId());
        bobEvent.setRegisteredCount(10);
        bobEvent.setCapacity(20);
        eventRepository.save(bobEvent);
    }

    @Test
    @DisplayName("GET /api/analytics/organizers - admin sees per-organizer aggregated totals")
    void testAdminSeesAggregatedOrganizerInsights() throws Exception {
        mockMvc.perform(get("/api/analytics/organizers")
                        .with(user("admin@example.com").authorities(() -> "SUPER_ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].organizerName",
                        Matchers.containsInAnyOrder("Alice Organizer", "Bob Organizer")))
                .andExpect(jsonPath("$[*].totalEvents",
                        Matchers.containsInAnyOrder(2, 1)))
                .andExpect(jsonPath("$[*].totalRegistrations",
                        Matchers.containsInAnyOrder(80, 10)))
                .andExpect(jsonPath("$[*].avgCapacityUtilization",
                        Matchers.containsInAnyOrder(0.5, 0.5)))
                .andExpect(jsonPath("$[*].averageRating",
                        Matchers.everyItem(Matchers.is(0.0))));
    }
}
