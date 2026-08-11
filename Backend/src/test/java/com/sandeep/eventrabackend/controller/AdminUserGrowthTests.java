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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #12073 — the admin user-growth endpoint must tally newly created user
 * accounts (signups), never event registrations. {@code AdminService.getUserGrowthTrend}
 * drives it from {@code userRepository.findMonthlySignupTrend}; these tests pin that.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminUserGrowthTests {

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

    @Test
    @DisplayName("User growth counts signups, grouped by month")
    void getUserGrowthTrend_CountsSignups() throws Exception {
        createClient("alice@example.com");
        createClient("bob@example.com");
        createClient("carol@example.com");

        String currentMonth = DateTimeFormatter.ofPattern("yyyy-MM").format(LocalDate.now());

        mockMvc.perform(get("/api/admin/analytics/users/growth?months=6")
                        .with(user("admin@example.com")
                                .authorities(new SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].period").value(currentMonth))
                .andExpect(jsonPath("$[0].registrationCount").value(4))
                .andExpect(jsonPath("$[0].cumulativeTotal").value(4));
    }

    @Test
    @DisplayName("Event registrations do not inflate the user growth trend")
    void getUserGrowthTrend_IgnoresRegistrations() throws Exception {
        User alice = createClient("alice@example.com");
        User bob = createClient("bob@example.com");
        User carol = createClient("carol@example.com");

        Event event = new Event();
        event.setTitle("Growth Test Event");
        event.setDescription("Description");
        event.setLocation("Location");
        event.setEventDate(LocalDateTime.now().plusDays(7));
        event.setCapacity(100);
        event.setPublic(true);
        Event savedEvent = eventRepository.save(event);

        // 3 registrations on top of the 4 user accounts — must not appear in growth.
        for (User attendee : new User[]{alice, bob, carol}) {
            EventRegistration registration = new EventRegistration();
            registration.setEvent(savedEvent);
            registration.setUser(attendee);
            eventRegistrationRepository.save(registration);
        }

        mockMvc.perform(get("/api/admin/analytics/users/growth?months=6")
                        .with(user("admin@example.com")
                                .authorities(new SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].registrationCount").value(4))
                .andExpect(jsonPath("$[0].cumulativeTotal").value(4));
    }
}
