package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.FeedbackRequest;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.*;
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
public class FeedbackControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private FeedbackAnalyticsRepository feedbackRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long eventId;
    private final String testUserEmail = "feedbackuser@example.com";

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        feedbackRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        // Create a test user
        User user = User.builder()
                .firstName("Feedback")
                .lastName("User")
                .email(testUserEmail)
                .username("feedbackuser")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(user);

        // Create a test event
        Event event = new Event();
        event.setTitle("Feedback Test Event");
        event.setCapacity(10);
        event.setEventDate(LocalDateTime.now().plusDays(5));
        event.setPublic(true);
        event = eventRepository.save(event);
        eventId = event.getId();
    }

    @Test
    @DisplayName("POST /api/feedback — Success")
    void testFeedbackSuccess() throws Exception {
        // Register user for event first
        EventRegistration registration = new EventRegistration();
        registration.setEvent(eventRepository.findById(eventId).orElseThrow());
        registration.setUser(userRepository.findByEmail(testUserEmail).orElseThrow());
        eventRegistrationRepository.save(registration);

        FeedbackRequest request = FeedbackRequest.builder()
                .eventId(eventId)
                .rating(5)
                .comment("Excellent event!")
                .build();

        mockMvc.perform(post("/api/feedback")
                        .with(user(testUserEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.eventId").value(eventId))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Excellent event!"));
    }

    @Test
    @DisplayName("POST /api/feedback — 400 Bad Request (Invalid Rating)")
    void testFeedbackInvalidRating() throws Exception {
        FeedbackRequest request = FeedbackRequest.builder()
                .eventId(eventId)
                .rating(6) // Max is 5
                .comment("Bad rating")
                .build();

        mockMvc.perform(post("/api/feedback")
                        .with(user(testUserEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/feedback — 404 Not Found (Event)")
    void testFeedbackEventNotFound() throws Exception {
        FeedbackRequest request = FeedbackRequest.builder()
                .eventId(99999L)
                .rating(4)
                .build();

        mockMvc.perform(post("/api/feedback")
                        .with(user(testUserEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/feedback — 403 Forbidden (Not Registered)")
    void testFeedbackNotRegistered() throws Exception {
        FeedbackRequest request = FeedbackRequest.builder()
                .eventId(eventId)
                .rating(4)
                .build();

        mockMvc.perform(post("/api/feedback")
                        .with(user(testUserEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("You must be registered for the event to provide feedback."));
    }

    @Test
    @DisplayName("POST /api/feedback — 409 Conflict (Duplicate Feedback)")
    void testFeedbackDuplicate() throws Exception {
        // Register user for event
        EventRegistration registration = new EventRegistration();
        registration.setEvent(eventRepository.findById(eventId).orElseThrow());
        registration.setUser(userRepository.findByEmail(testUserEmail).orElseThrow());
        eventRegistrationRepository.save(registration);

        FeedbackRequest request = FeedbackRequest.builder()
                .eventId(eventId)
                .rating(5)
                .build();

        // First submission
        mockMvc.perform(post("/api/feedback")
                        .with(user(testUserEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Second submission
        mockMvc.perform(post("/api/feedback")
                        .with(user(testUserEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("You have already submitted feedback for this event."));
    }

    @Test
    @DisplayName("POST /api/feedback — 401 Unauthorized")
    void testFeedbackUnauthorized() throws Exception {
        FeedbackRequest request = FeedbackRequest.builder()
                .eventId(eventId)
                .rating(5)
                .build();

        mockMvc.perform(post("/api/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
