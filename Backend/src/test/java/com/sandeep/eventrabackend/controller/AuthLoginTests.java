package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #11772 — users who register with a mixed-case email must be able to
 * log in: signup lowercases the email before persisting, so the login/lookup
 * path has to normalize the identifier the same way.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthLoginTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();

        // Simulates a signup performed with a mixed-case email: signup normalizes
        // the email to lowercase before persisting (see AuthService.signup).
        userRepository.save(User.builder()
                .firstName("Mixed")
                .lastName("Case")
                .email("user@example.com")
                .username("user")
                .password(passwordEncoder.encode("password123"))
                .role(Role.CLIENT)
                .build());
    }

    private LoginRequest loginRequest(String identifier) {
        LoginRequest request = new LoginRequest();
        request.setUsernameOrEmail(identifier);
        request.setPassword("password123");
        return request;
    }

    @Test
    @DisplayName("POST /api/auth/login with the original mixed-case email succeeds (#11772)")
    void testLoginWithMixedCaseEmail() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest("User@Example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/login with the normalized lowercase email succeeds (#11772)")
    void testLoginWithNormalizedEmail() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest("user@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(cookie().exists("token"))
                .andExpect(cookie().httpOnly("token", true));
    }

    @Test
    @DisplayName("POST /api/auth/login with a fully-uppercased email succeeds (#11772)")
    void testLoginWithUppercaseEmail() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest("USER@EXAMPLE.COM"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/login with a wrong password still fails (#11772)")
    void testLoginWrongPassword() throws Exception {
        LoginRequest request = loginRequest("User@Example.com");
        request.setPassword("wrong-password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/google with an invalid token returns 400, not 500 (#12079)")
    void testGoogleLoginInvalidTokenReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"not-a-valid-google-token\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid Google token"));
    }
}
