package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.EventRoleAuditLogRepository;
import com.sandeep.eventrabackend.repository.EventTeamMemberRepository;
import com.sandeep.eventrabackend.repository.EventWaitlistRepository;
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

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #12615 — {@code GET /api/events/{id}/registrants} must serve the
 * paginated {@code { data, totalPages }} contract consumed by the CSV/JSON
 * export in {@code src/Pages/Events/EventDetails.js}, restricted to the event's
 * organizers and platform admins.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventRegistrantsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private EventWaitlistRepository eventWaitlistRepository;

    @Autowired
    private EventTeamMemberRepository eventTeamMemberRepository;

    @Autowired
    private EventRoleAuditLogRepository eventRoleAuditLogRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User organizer;
    private Event event;

    @BeforeEach
    void setUp() {
        hackathonRegistrationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventWaitlistRepository.deleteAll();
        eventTeamMemberRepository.deleteAll();
        eventRoleAuditLogRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        organizer = userRepository.save(User.builder()
                .firstName("Org")
                .lastName("Nizer")
                .email("organizer@example.com")
                .username("organizer")
                .password(passwordEncoder.encode("password"))
                .role(Role.ORGANIZER)
                .build());

        event = new Event();
        event.setTitle("Registrants Test Event");
        event.setDescription("Description");
        event.setLocation("Location");
        event.setEventDate(LocalDateTime.now().plusDays(7));
        event.setCapacity(100);
        event.setPublic(true);
        event.setOwnerId(organizer.getId());
        event = eventRepository.save(event);
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

    private EventRegistration register(User attendee) {
        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(attendee);
        return eventRegistrationRepository.save(registration);
    }

    @Test
    @DisplayName("Organizer can export all registrants with data and totalPages")
    void getRegistrants_OrganizerSeesAll() throws Exception {
        register(createClient("alice@example.com"));
        register(createClient("bob@example.com"));

        mockMvc.perform(get("/api/events/{id}/registrants", event.getId())
                        .with(user(organizer.getEmail())
                                .authorities(new SimpleGrantedAuthority("ORGANIZER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.data[0].email").exists())
                .andExpect(jsonPath("$.data[0].status").value("CONFIRMED"));
    }

    @Test
    @DisplayName("Paginates registrants (page is 1-based) and respects limit")
    void getRegistrants_Pagination() throws Exception {
        register(createClient("alice@example.com"));
        register(createClient("bob@example.com"));
        register(createClient("carol@example.com"));

        mockMvc.perform(get("/api/events/{id}/registrants", event.getId())
                        .param("page", "1")
                        .param("limit", "2")
                        .with(user(organizer.getEmail())
                                .authorities(new SimpleGrantedAuthority("ORGANIZER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.totalPages").value(2));

        mockMvc.perform(get("/api/events/{id}/registrants", event.getId())
                        .param("page", "2")
                        .param("limit", "2")
                        .with(user(organizer.getEmail())
                                .authorities(new SimpleGrantedAuthority("ORGANIZER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.totalPages").value(2));
    }

    @Test
    @DisplayName("Platform admin can fetch registrants")
    void getRegistrants_AdminAllowed() throws Exception {
        User admin = userRepository.save(User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .username("admin")
                .password(passwordEncoder.encode("password"))
                .role(Role.ADMIN)
                .build());

        mockMvc.perform(get("/api/events/{id}/registrants", event.getId())
                        .with(user(admin.getEmail())
                                .authorities(new SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)))
                .andExpect(jsonPath("$.totalPages").value(0));
    }

    @Test
    @DisplayName("Non-organizer attendee gets 403")
    void getRegistrants_ForbiddenForClient() throws Exception {
        User client = createClient("client@example.com");

        mockMvc.perform(get("/api/events/{id}/registrants", event.getId())
                        .with(user(client.getEmail())
                                .authorities(new SimpleGrantedAuthority("CLIENT"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unauthenticated request gets 401")
    void getRegistrants_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/events/{id}/registrants", event.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Unknown event gets 404")
    void getRegistrants_UnknownEvent() throws Exception {
        mockMvc.perform(get("/api/events/999999/registrants")
                        .with(user(organizer.getEmail())
                                .authorities(new SimpleGrantedAuthority("ORGANIZER"))))
                .andExpect(status().isNotFound());
    }
}
