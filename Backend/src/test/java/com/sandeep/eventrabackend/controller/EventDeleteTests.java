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

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EventDeleteTests {

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
                .firstName("SuperAdmin")
                .lastName("User")
                .email("superadmin@example.com")
                .username("superadmin")
                .password(passwordEncoder.encode("password"))
                .role(Role.SUPER_ADMIN)
                .build());

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
        event.setTitle("Event to delete");
        event.setDescription("Description");
        event.setLocation("Location");
        event.setEventDate(LocalDateTime.now().plusDays(5));
        event.setCapacity(100);
        event.setPublic(true);
        existingEvent = eventRepository.save(event);
    }

    @Test
    @DisplayName("ADMIN can delete event successfully")
    void deleteEvent_AsAdmin_Success() throws Exception {
        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("admin@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isNoContent());

        assertFalse(eventRepository.existsById(existingEvent.getId()));
    }

    @Test
    @DisplayName("SUPER_ADMIN can delete event successfully")
    void deleteEvent_AsSuperAdmin_Success() throws Exception {
        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("superadmin@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("SUPER_ADMIN"))))
                .andExpect(status().isNoContent());

        assertFalse(eventRepository.existsById(existingEvent.getId()));
    }

    @Test
    @DisplayName("Deletion cleans up registrations")
    void deleteEvent_CleansUpRegistrations() throws Exception {
        // Create a registration
        User client = userRepository.findByEmail("client@example.com").orElseThrow();
        EventRegistration registration = new EventRegistration();
        registration.setEvent(existingEvent);
        registration.setUser(client);
        registration.setStatus("CONFIRMED");
        eventRegistrationRepository.save(registration);

        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("admin@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isNoContent());

        assertFalse(eventRepository.existsById(existingEvent.getId()));
        assertFalse(eventRegistrationRepository.existsByEvent_IdAndUser_Email(existingEvent.getId(), client.getEmail()));
    }

    @Test
    @DisplayName("ORGANIZER cannot delete event")
    void deleteEvent_AsOrganizer_Forbidden() throws Exception {
        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("organizer@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ORGANIZER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CLIENT cannot delete event")
    void deleteEvent_AsClient_Forbidden() throws Exception {
        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("client@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("CLIENT"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Deleting non-existent event returns 404")
    void deleteEvent_NonExistent_NotFound() throws Exception {
        mockMvc.perform(delete("/api/events/999999")
                        .with(user("admin@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Event not found with id: 999999"));
    }
}
