package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #12611 — {@code /api/validate/email/{email}} and
 * {@code /api/validate/username/{username}} must power the pre-submit
 * availability checks in {@code src/utils/validationApi.js}, and be reachable
 * without authentication.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ValidationControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    private User createUser(String email, String username) {
        return userRepository.save(User.builder()
                .firstName("Test")
                .lastName("User")
                .email(email)
                .username(username)
                .password(passwordEncoder.encode("secret"))
                .role(Role.CLIENT)
                .build());
    }

    @Test
    @DisplayName("Returns available=true for a free email")
    void validateEmail_Available() throws Exception {
        mockMvc.perform(get("/api/validate/email/new@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    @DisplayName("Returns available=false for a registered email")
    void validateEmail_Taken() throws Exception {
        createUser("taken@example.com", "taken");

        mockMvc.perform(get("/api/validate/email/taken@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    @DisplayName("Rejects a malformed email with 400")
    void validateEmail_InvalidFormat() throws Exception {
        mockMvc.perform(get("/api/validate/email/not-an-email"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Returns available=true for a free username")
    void validateUsername_Available() throws Exception {
        mockMvc.perform(get("/api/validate/username/newuser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }

    @Test
    @DisplayName("Returns available=false for a taken username")
    void validateUsername_Taken() throws Exception {
        createUser("owner@example.com", "takenuser");

        mockMvc.perform(get("/api/validate/username/takenuser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    @DisplayName("Rejects an invalid username with 400")
    void validateUsername_InvalidFormat() throws Exception {
        mockMvc.perform(get("/api/validate/username/ab"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Rejects a username with illegal characters with 400")
    void validateUsername_IllegalCharacters() throws Exception {
        mockMvc.perform(get("/api/validate/username/bad user!"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Endpoints are reachable without authentication")
    void validate_AnonymousAccess() throws Exception {
        mockMvc.perform(get("/api/validate/email/anon@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));

        mockMvc.perform(get("/api/validate/username/anonuser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true));
    }
}
