package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRepository;
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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EventCancelTests {

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

    private Event existingEvent;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
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
    @DisplayName("Cancel without refund policy returns 400")
    void cancelEvent_MissingRefundPolicy_BadRequest() throws Exception {
        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "weather"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Invalid refund policy value returns 400")
    void cancelEvent_InvalidRefundPolicy_BadRequest() throws Exception {
        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "weather", "refundPolicy", "refund"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PARTIAL refund with out-of-range percentage returns 400")
    void cancelEvent_PartialRefundPercentOutOfRange_BadRequest() throws Exception {
        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("reason", "weather", "refundPolicy", "PARTIAL", "refundPercent", 150))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PARTIAL refund without percentage returns 400")
    void cancelEvent_PartialMissingRefundPercent_BadRequest() throws Exception {
        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "weather", "refundPolicy", "PARTIAL"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Valid FULL refund policy cancels the event")
    void cancelEvent_FullRefund_Success() throws Exception {
        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "weather", "refundPolicy", "FULL"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.refundPolicy").value("FULL"));
    }

    @Test
    @DisplayName("Valid PARTIAL refund policy cancels the event")
    void cancelEvent_PartialRefund_Success() throws Exception {
        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                Map.of("reason", "weather", "refundPolicy", "PARTIAL", "refundPercent", 50))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.refundPolicy").value("PARTIAL"))
                .andExpect(jsonPath("$.refundPercent").value(50));
    }

    @Test
    @DisplayName("Valid NONE refund policy cancels the event")
    void cancelEvent_NoneRefund_Success() throws Exception {
        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "weather", "refundPolicy", "NONE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.refundPolicy").value("NONE"));
    }

    @Test
    @DisplayName("Cancelling an already-cancelled event is idempotent")
    void cancelEvent_AlreadyCancelled_IdempotentSuccess() throws Exception {
        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "weather", "refundPolicy", "FULL"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        mockMvc.perform(post("/api/events/" + existingEvent.getId() + "/cancel")
                        .with(user("admin@example.com").authorities(new SimpleGrantedAuthority("ADMIN")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "weather", "refundPolicy", "FULL"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"))
                .andExpect(jsonPath("$.refundPolicy").value("FULL"));
    }
}
