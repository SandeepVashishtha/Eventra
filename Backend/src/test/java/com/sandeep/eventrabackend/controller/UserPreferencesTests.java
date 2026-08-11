package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserPreferencesTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        userRepository.deleteAll();

        User u = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .username("johndoe")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(u);
    }

    @Test
    @DisplayName("PUT /api/users/preferences - saves theme and GET /preferences reloads it")
    void testUpdateAndReloadPreferences() throws Exception {
        mockMvc.perform(put("/api/users/preferences")
                        .with(user("john@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "preferences": { "theme": "dark" } }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.theme").value("dark"));

        mockMvc.perform(get("/api/users/preferences")
                        .with(user("john@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.theme").value("dark"));
    }

    @Test
    @DisplayName("Saved preferences appear on the profile response")
    void testPreferencesExposedOnProfile() throws Exception {
        mockMvc.perform(put("/api/users/preferences")
                        .with(user("john@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "preferences": { "theme": "system" } }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.theme").value("system"));

        mockMvc.perform(get("/api/users/profile")
                        .with(user("john@example.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferences.theme").value("system"));
    }

    @Test
    @DisplayName("PUT /api/users/preferences - rejects invalid theme")
    void testUpdatePreferencesInvalidTheme() throws Exception {
        mockMvc.perform(put("/api/users/preferences")
                        .with(user("john@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "preferences": { "theme": "neon" } }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/users/preferences - Unauthorized")
    void testUpdatePreferences_Unauthorized() throws Exception {
        mockMvc.perform(put("/api/users/preferences")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "preferences": { "theme": "dark" } }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/users/preferences - rejects unknown keys")
    void testUpdatePreferences_RejectsUnknownKeys() throws Exception {
        mockMvc.perform(put("/api/users/preferences")
                        .with(user("john@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "preferences": { "evilKey": "payload" } }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unknown preference key: evilKey. Allowed keys: theme, notifications"));
    }

    @Test
    @DisplayName("PUT /api/users/preferences - accepts notifications object")
    void testUpdatePreferences_AcceptsNotifications() throws Exception {
        mockMvc.perform(put("/api/users/preferences")
                        .with(user("john@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "preferences": { "notifications": { "inApp": true, "push": false } } }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notifications.inApp").value(true))
                .andExpect(jsonPath("$.notifications.push").value(false));
    }

    @Test
    @DisplayName("PUT /api/users/preferences - rejects oversized payload")
    void testUpdatePreferences_RejectsOversizedPayload() throws Exception {
        String padding = "x".repeat(5000);
        mockMvc.perform(put("/api/users/preferences")
                        .with(user("john@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "preferences": { "notifications": { "blob": "%s" } } }
                                """.formatted(padding)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Preferences payload exceeds maximum size of 4096 bytes"));
    }
}
