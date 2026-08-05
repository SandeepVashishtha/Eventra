package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.EventCreateRequest;
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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EventCreationTests {

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

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        // Create users with different roles
        userRepository.save(User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .username("admin")
                .password(passwordEncoder.encode("password"))
                .role(Role.ADMIN)
                .build());

        userRepository.save(User.builder()
                .firstName("Organizer")
                .lastName("User")
                .email("organizer@example.com")
                .username("organizer")
                .password(passwordEncoder.encode("password"))
                .role(Role.ORGANIZER)
                .build());

        userRepository.save(User.builder()
                .firstName("Client")
                .lastName("User")
                .email("client@example.com")
                .username("client")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());
    }

    @Test
    @DisplayName("ORGANIZER can create event and gets 201")
    void testOrganizerCanCreateEvent() throws Exception {
        EventCreateRequest request = EventCreateRequest.builder()
                .title("Organizer Event")
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().plusDays(1))
                .capacity(100)
                .isPublic(true)
                .build();

        mockMvc.perform(post("/api/events/create")
                        .with(user("organizer@example.com").authorities(() -> "ORGANIZER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Organizer Event"))
                .andExpect(jsonPath("$.registeredCount").value(0));
    }

    @Test
    @DisplayName("ADMIN can create event and gets 201")
    void testAdminCanCreateEvent() throws Exception {
        EventCreateRequest request = EventCreateRequest.builder()
                .title("Admin Event")
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().plusDays(1))
                .capacity(50)
                .isPublic(true)
                .build();

        mockMvc.perform(post("/api/events/create")
                        .with(user("admin@example.com").authorities(() -> "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Admin Event"));
    }

    @Test
    @DisplayName("unauthenticated request gets 401")
    void testUnauthenticatedRequest() throws Exception {
        EventCreateRequest request = EventCreateRequest.builder()
                .title("Unauth Event")
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().plusDays(1))
                .build();

        mockMvc.perform(post("/api/events/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CLIENT request gets 403")
    void testClientRequestForbidden() throws Exception {
        EventCreateRequest request = EventCreateRequest.builder()
                .title("Client Event")
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().plusDays(1))
                .build();

        mockMvc.perform(post("/api/events/create")
                        .with(user("client@example.com").authorities(() -> "CLIENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("invalid payload gets 400")
    void testInvalidPayload() throws Exception {
        EventCreateRequest request = EventCreateRequest.builder()
                .title("") // Blank title
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().minusDays(1)) // Past date
                .capacity(-10) // Negative capacity
                .build();

        mockMvc.perform(post("/api/events/create")
                        .with(user("admin@example.com").authorities(() -> "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("omitted isPublic defaults to true")
    void testOmittedIsPublicDefaultsToTrue() throws Exception {
        EventCreateRequest request = EventCreateRequest.builder()
                .title("Default Public Event")
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().plusDays(1))
                .build();

        mockMvc.perform(post("/api/events/create")
                        .with(user("admin@example.com").authorities(() -> "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.public").value(true)); // JPA often maps isPublic to public in JSON
    }

    @Test
    @DisplayName("isPublic false persists a private event")
    void testIsPublicFalsePersistsPrivateEvent() throws Exception {
        EventCreateRequest request = EventCreateRequest.builder()
                .title("Private Event")
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().plusDays(1))
                .isPublic(false)
                .build();

        mockMvc.perform(post("/api/events/create")
                        .with(user("admin@example.com").authorities(() -> "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.public").value(false));
    }
}
