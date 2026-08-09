package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.dto.response.AuthResponse;
import com.sandeep.eventrabackend.model.PasswordResetToken;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.PasswordResetTokenRepository;
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
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "app.rate-limit.enabled=false")
public class AuthPasswordResetTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();

        userRepository.save(User.builder()
                .firstName("Test")
                .lastName("User")
                .email("test@example.com")
                .username("testuser")
                .password(passwordEncoder.encode("oldPassword123"))
                .role(Role.CLIENT)
                .build());
    }

    private String requestForgotPassword(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).path("resetToken").asText("");
    }

    @Test
    @DisplayName("POST /api/auth/forgot-password for existing email issues a reset token")
    void testForgotPasswordForExistingEmail() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "test@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(containsString("password reset link")))
                .andExpect(jsonPath("$.resetToken").isNotEmpty());
    }

    @Test
    @DisplayName("POST /api/auth/forgot-password for unknown email does not enumerate accounts")
    void testForgotPasswordForUnknownEmail() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "nobody@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(containsString("password reset link")))
                .andExpect(jsonPath("$", not(hasKey("resetToken"))));
    }

    @Test
    @DisplayName("POST /api/auth/forgot-password with invalid email returns 400")
    void testForgotPasswordWithInvalidEmail() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", "not-an-email"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Full flow: reset token sets new password and new password works on login")
    void testFullResetFlow() throws Exception {
        String token = requestForgotPassword("test@example.com");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "token", token,
                                "newPassword", "brandNewPass123",
                                "confirmPassword", "brandNewPass123"))))
                .andExpect(status().isOk());

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmail("testuser");
        loginRequest.setPassword("brandNewPass123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Reset token is single-use and cannot be replayed")
    void testResetTokenIsSingleUse() throws Exception {
        String token = requestForgotPassword("test@example.com");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "token", token,
                                "newPassword", "brandNewPass123",
                                "confirmPassword", "brandNewPass123"))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "token", token,
                                "newPassword", "anotherPass123",
                                "confirmPassword", "anotherPass123"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Reset with an unknown or garbage token returns 400")
    void testResetWithInvalidToken() throws Exception {
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "token", "garbage-token",
                                "newPassword", "brandNewPass123",
                                "confirmPassword", "brandNewPass123"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Reset with mismatched confirmation returns 400")
    void testResetWithMismatchedPassword() throws Exception {
        String token = requestForgotPassword("test@example.com");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "token", token,
                                "newPassword", "brandNewPass123",
                                "confirmPassword", "differentPass123"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Reset with a password shorter than 8 characters returns 400")
    void testResetWithShortPassword() throws Exception {
        String token = requestForgotPassword("test@example.com");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "token", token,
                                "newPassword", "short",
                                "confirmPassword", "short"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Expired reset token is rejected")
    void testResetWithExpiredToken() throws Exception {
        String rawToken = "expired-token-value";
        User user = userRepository.findByEmail("test@example.com").orElseThrow();
        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(user)
                .tokenHash(sha256(rawToken))
                .expiresAt(LocalDateTime.now().minusMinutes(5))
                .used(false)
                .build());

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "token", rawToken,
                                "newPassword", "brandNewPass123",
                                "confirmPassword", "brandNewPass123"))))
                .andExpect(status().isBadRequest());
    }

    private String sha256(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
