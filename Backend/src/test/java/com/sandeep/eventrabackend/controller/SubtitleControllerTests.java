package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.subtitles.SubtitleRepository;
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
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SubtitleControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubtitleRepository subtitleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final String organizerEmail = "suborganizer@example.com";
    private final String attendeeEmail = "subattendee@example.com";
    private Long eventId;
    private Long organizerId;

    @BeforeEach
    void setUp() {
        subtitleRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        User organizer = User.builder()
                .firstName("Sub")
                .lastName("Organizer")
                .email(organizerEmail)
                .username("suborganizer")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(organizer);
        organizerId = organizer.getId();

        User attendee = User.builder()
                .firstName("Sub")
                .lastName("Attendee")
                .email(attendeeEmail)
                .username("subattendee")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(attendee);

        Event event = new Event();
        event.setTitle("Subtitle Test Event");
        event.setCapacity(50);
        event.setEventDate(LocalDateTime.now().plusDays(1));
        event.setOwnerId(organizerId);
        event.setPublic(true);
        event = eventRepository.save(event);
        eventId = event.getId();
    }

    @Test
    @DisplayName("POST /api/v1/subtitles — organizer creates subtitle via eventId")
    void testCreateSubtitleWithEventId() throws Exception {
        mockMvc.perform(post("/api/v1/subtitles")
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "eventId", eventId,
                                "originalText", "Hello world",
                                "translatedText", "Bonjour le monde",
                                "sourceLanguage", "en",
                                "targetLanguage", "fr"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventId").value(eventId))
                .andExpect(jsonPath("$.originalText").value("Hello world"));
    }

    @Test
    @DisplayName("POST /api/v1/subtitles — organizer creates subtitle via sessionId resolving to event (#17835)")
    void testCreateSubtitleViaSession() throws Exception {
        MvcResult sessionResult = mockMvc.perform(post("/api/v1/subtitles/session/start")
                        .with(user(organizerEmail))
                        .param("eventId", String.valueOf(eventId)))
                .andExpect(status().isCreated())
                .andReturn();
        String sessionId = objectMapper.readTree(sessionResult.getResponse().getContentAsString())
                .get("sessionId").asText();

        mockMvc.perform(post("/api/v1/subtitles")
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "sessionId", sessionId,
                                "originalText", "Hello session",
                                "translatedText", "Bonjour session",
                                "sourceLanguage", "en",
                                "targetLanguage", "fr"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.eventId").value(eventId));
    }

    @Test
    @DisplayName("POST /api/v1/subtitles — missing eventId and sessionId rejected with 400 (#17835)")
    void testCreateSubtitleWithoutEventOrSession() throws Exception {
        mockMvc.perform(post("/api/v1/subtitles")
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "originalText", "Hello",
                                "translatedText", "Bonjour",
                                "sourceLanguage", "en",
                                "targetLanguage", "fr"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/subtitles — unknown sessionId rejected with 400 (#17835)")
    void testCreateSubtitleWithUnknownSession() throws Exception {
        mockMvc.perform(post("/api/v1/subtitles")
                        .with(user(organizerEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "sessionId", "session-that-does-not-exist",
                                "originalText", "Hello",
                                "translatedText", "Bonjour",
                                "sourceLanguage", "en",
                                "targetLanguage", "fr"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/subtitles — attendee (not organizer) denied with 403")
    void testCreateSubtitleForbiddenForAttendee() throws Exception {
        mockMvc.perform(post("/api/v1/subtitles")
                        .with(user(attendeeEmail))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "eventId", eventId,
                                "originalText", "Hello",
                                "translatedText", "Bonjour",
                                "sourceLanguage", "en",
                                "targetLanguage", "fr"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/v1/subtitles/user/{id} — owner reads own subtitles, others denied (#17835)")
    void testGetSubtitlesByUserAuthorization() throws Exception {
        mockMvc.perform(get("/api/v1/subtitles/user/{userId}", organizerId)
                        .with(user(organizerEmail)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/v1/subtitles/user/{userId}", organizerId)
                        .with(user(attendeeEmail)))
                .andExpect(status().isForbidden());
    }
}
