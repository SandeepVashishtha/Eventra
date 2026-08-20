package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.RecoverySessionRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SessionRecoveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecoverySessionRepository recoverySessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @BeforeEach
    void setUp() {
        recoverySessionRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .firstName("Session")
                .lastName("Tester")
                .email("tester@example.com")
                .username("tester")
                .password(passwordEncoder.encode("password123"))
                .role(Role.CLIENT)
                .build());
    }

    @Test
    @DisplayName("POST /api/session-recovery without authentication returns 401 (#14203)")
    void save_WithoutAuth_Returns401() throws Exception {
        mockMvc.perform(post("/api/session-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "Draft"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/session-recovery with empty body returns 400 (#14203)")
    @WithMockUser(username = "tester@example.com")
    void save_EmptyBody_Returns400() throws Exception {
        mockMvc.perform(post("/api/session-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Bad Request"));
    }

    @Test
    @DisplayName("POST /api/session-recovery with valid payload returns 201 Created (#14203)")
    @WithMockUser(username = "tester@example.com")
    void save_ValidPayload_Returns201() throws Exception {
        Map<String, Object> payload = Map.of(
                "sessionId", "session-101",
                "name", "Form Draft",
                "type", "event_registration",
                "draftData", Map.of("step", 2, "eventId", "ev-123")
        );

        mockMvc.perform(post("/api/session-recovery")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionId").value("session-101"))
                .andExpect(jsonPath("$.name").value("Form Draft"))
                .andExpect(jsonPath("$.type").value("event_registration"));
    }

    @Test
    @DisplayName("GET /api/session-recovery lists active sessions for user (#14203)")
    @WithMockUser(username = "tester@example.com")
    void list_ReturnsSessions() throws Exception {
        mockMvc.perform(get("/api/session-recovery"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessions").isArray());
    }

    @Test
    @DisplayName("PUT /api/session-recovery/{id} updates existing draft (#14203)")
    @WithMockUser(username = "tester@example.com")
    void update_ExistingSession_Returns200() throws Exception {
        Map<String, Object> payload = Map.of(
                "name", "Updated Draft",
                "type", "generic",
                "draftData", Map.of("data", "hello")
        );

        mockMvc.perform(put("/api/session-recovery/session-101")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value("session-101"))
                .andExpect(jsonPath("$.name").value("Updated Draft"));
    }

    @Test
    @DisplayName("POST /api/session-recovery/{id}/restore restores session draft (#14203)")
    @WithMockUser(username = "tester@example.com")
    void restore_ExistingSession_Returns200() throws Exception {
        // Create session first
        Map<String, Object> payload = Map.of(
                "sessionId", "restore-me",
                "name", "Restore Test",
                "draftData", Map.of("restored", true)
        );
        mockMvc.perform(post("/api/session-recovery")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)));

        mockMvc.perform(post("/api/session-recovery/restore-me/restore"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.session.sessionId").value("restore-me"));
    }

    @Test
    @DisplayName("DELETE /api/session-recovery/{id} deletes specified draft (#14203)")
    @WithMockUser(username = "tester@example.com")
    void delete_ExistingSession_Returns204() throws Exception {
        mockMvc.perform(delete("/api/session-recovery/del-101"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/session-recovery/cleanup cleans up expired sessions (#14203)")
    @WithMockUser(username = "tester@example.com")
    void cleanup_ExpiredSessions_Returns200() throws Exception {
        mockMvc.perform(delete("/api/session-recovery/cleanup"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deleted").exists());
    }
}
