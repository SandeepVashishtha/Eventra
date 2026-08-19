package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.subtitles.Subtitle;
import com.sandeep.eventrabackend.subtitles.SubtitleRepository;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #17836 — subtitle READ endpoints must enforce per-event authorization.
 * Only the event organizer (or an admin) may read an event's captions;
 * any other authenticated user gets 403.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SubtitleAccessControlTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubtitleRepository subtitleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long subtitleId;
    private String subtitleUuid;
    private Long eventId;
    private final String organizerEmail = "suborganizer@example.com";
    private final String attackerEmail = "subattacker@example.com";
    private final String adminEmail = "subadmin@example.com";

    @BeforeEach
    void setUp() {
        subtitleRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        User organizer = userRepository.save(User.builder()
                .firstName("Sub")
                .lastName("Organizer")
                .email(organizerEmail)
                .username("suborganizer")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        userRepository.save(User.builder()
                .firstName("Sub")
                .lastName("Attacker")
                .email(attackerEmail)
                .username("subattacker")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        userRepository.save(User.builder()
                .firstName("Sub")
                .lastName("Admin")
                .email(adminEmail)
                .username("subadmin")
                .password(passwordEncoder.encode("password"))
                .role(Role.ADMIN)
                .build());

        Event event = new Event();
        event.setTitle("Subtitle Access Test Event");
        event.setCapacity(50);
        event.setEventDate(LocalDateTime.now().plusDays(10));
        event.setOwnerId(organizer.getId());
        event.setPublic(true);
        event = eventRepository.save(event);
        eventId = event.getId();

        Subtitle subtitle = Subtitle.builder()
                .eventId(eventId)
                .originalText("Hello")
                .translatedText("Hola")
                .sourceLanguage("en")
                .targetLanguage("es")
                .build();
        subtitle = subtitleRepository.save(subtitle);
        subtitleId = subtitle.getId();
        subtitleUuid = subtitle.getUuid();
    }

    @Test
    @DisplayName("Event organizer can read all subtitle endpoints (200)")
    void organizerCanReadEventSubtitles() throws Exception {
        mockMvc.perform(get("/api/v1/subtitles/{id}", subtitleId).with(user(organizerEmail)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/subtitles/uuid/{uuid}", subtitleUuid).with(user(organizerEmail)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/subtitles/event/{eventId}", eventId).with(user(organizerEmail)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/subtitles/event/{eventId}/active", eventId).with(user(organizerEmail)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/subtitles/event/{eventId}/recent", eventId).with(user(organizerEmail)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Admin can read any event's subtitle endpoints (200)")
    void adminCanReadEventSubtitles() throws Exception {
        mockMvc.perform(get("/api/v1/subtitles/{id}", subtitleId).with(user(adminEmail)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/subtitles/uuid/{uuid}", subtitleUuid).with(user(adminEmail)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/subtitles/event/{eventId}", eventId).with(user(adminEmail)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/subtitles/event/{eventId}/active", eventId).with(user(adminEmail)))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/subtitles/event/{eventId}/recent", eventId).with(user(adminEmail)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Unrelated user is denied on every subtitle read endpoint (403)")
    void attackerIsDeniedEverywhere() throws Exception {
        mockMvc.perform(get("/api/v1/subtitles/{id}", subtitleId).with(user(attackerEmail)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/subtitles/uuid/{uuid}", subtitleUuid).with(user(attackerEmail)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/subtitles/event/{eventId}", eventId).with(user(attackerEmail)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/subtitles/event/{eventId}/active", eventId).with(user(attackerEmail)))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/subtitles/event/{eventId}/recent", eventId).with(user(attackerEmail)))
                .andExpect(status().isForbidden());
    }
}
