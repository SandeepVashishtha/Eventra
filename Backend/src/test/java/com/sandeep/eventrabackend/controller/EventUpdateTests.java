package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.EventUpdateRequest;
import com.sandeep.eventrabackend.model.Event;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EventUpdateTests {

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

    private Event existingEvent;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        // Create users
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

        // Create an existing event
        Event event = new Event();
        event.setTitle("Original Title");
        event.setDescription("Original Description");
        event.setLocation("Original Location");
        event.setEventDate(LocalDateTime.now().plusDays(5));
        event.setCapacity(100);
        event.setPublic(true);
        existingEvent = eventRepository.save(event);
    }

    @Test
    @DisplayName("ORGANIZER can update event successfully")
    void testOrganizerCanUpdateEvent() throws Exception {
        EventUpdateRequest request = EventUpdateRequest.builder()
                .title("Updated Title")
                .description("Updated Description")
                .location("Updated Location")
                .eventDate(LocalDateTime.now().plusDays(10))
                .capacity(150)
                .isPublic(false)
                .build();

        mockMvc.perform(put("/api/events/" + existingEvent.getId())
                        .with(user("organizer@example.com").authorities(() -> "ORGANIZER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.public").value(false))
                .andExpect(jsonPath("$.capacity").value(150));
    }

    @Test
    @DisplayName("ADMIN can update event successfully")
    void testAdminCanUpdateEvent() throws Exception {
        EventUpdateRequest request = EventUpdateRequest.builder()
                .title("Admin Updated Title")
                .description("Updated Description")
                .location("Updated Location")
                .eventDate(LocalDateTime.now().plusDays(10))
                .capacity(200)
                .isPublic(true)
                .build();

        mockMvc.perform(put("/api/events/" + existingEvent.getId())
                        .with(user("admin@example.com").authorities(() -> "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Admin Updated Title"));
    }

    @Test
    @DisplayName("CLIENT cannot update event - 403 Forbidden")
    void testClientCannotUpdateEvent() throws Exception {
        EventUpdateRequest request = EventUpdateRequest.builder()
                .title("Client Update Attempt")
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().plusDays(10))
                .build();

        mockMvc.perform(put("/api/events/" + existingEvent.getId())
                        .with(user("client@example.com").authorities(() -> "CLIENT"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Missing event returns 404")
    void testUpdateNonExistentEvent() throws Exception {
        EventUpdateRequest request = EventUpdateRequest.builder()
                .title("Updated Title")
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().plusDays(10))
                .build();

        mockMvc.perform(put("/api/events/999")
                        .with(user("admin@example.com").authorities(() -> "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Event not found with id: 999"));
    }

    @Test
    @DisplayName("Invalid payload returns 400")
    void testUpdateWithInvalidPayload() throws Exception {
        EventUpdateRequest request = EventUpdateRequest.builder()
                .title("") // Blank title
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().minusDays(1)) // Past date
                .capacity(-10) // Negative capacity
                .build();

        mockMvc.perform(put("/api/events/" + existingEvent.getId())
                        .with(user("admin@example.com").authorities(() -> "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Capacity lower than registeredCount returns 409 (Conflict)")
    void testUpdateCapacityLowerThanRegisteredCount() throws Exception {
        // Manually set registeredCount for the event
        existingEvent.setRegisteredCount(10);
        eventRepository.save(existingEvent);

        EventUpdateRequest request = EventUpdateRequest.builder()
                .title("Capacity Update")
                .description("Description")
                .location("Location")
                .eventDate(LocalDateTime.now().plusDays(5))
                .capacity(5) // Less than registeredCount(10)
                .isPublic(true)
                .build();

        mockMvc.perform(put("/api/events/" + existingEvent.getId())
                        .with(user("admin@example.com").authorities(() -> "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }
}
