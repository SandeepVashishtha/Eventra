package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.ConfirmResetPasswordRequest;
import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.dto.request.ResetPasswordRequest;
import com.sandeep.eventrabackend.model.PasswordResetToken;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.NotificationRepository;
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
import org.springframework.test.web.servlet.MockMvc;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthPasswordResetTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @BeforeEach
    void setUp() {
        passwordResetTokenRepository.deleteAll();
        notificationRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .firstName("Test")
                .lastName("User")
                .email("testuser@example.com")
                .username("testuser")
                .password(passwordEncoder.encode("oldPassword123"))
                .role(Role.ATTENDEE)
                .emailVerified(true)
                .build());
    }

    private String hashToken(String rawToken) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder(hash.length * 2);
        for (byte b : hash) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    @Test
    @DisplayName("POST /api/auth/reset-password creates password reset token in repository (#17860)")
    void testRequestPasswordResetSuccess() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("testuser@example.com");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account exists for that email, a password reset link has been sent."));

        assertEquals(1, passwordResetTokenRepository.count());
        PasswordResetToken token = passwordResetTokenRepository.findAll().get(0);
        assertEquals(testUser.getId(), token.getUser().getId());
        assertFalse(token.isUsed());
    }

    @Test
    @DisplayName("POST /api/auth/reset-password/confirm updates password and allows login with new password (#17860)")
    void testConfirmPasswordResetSuccessAndLogin() throws Exception {
        String rawToken = "sample-valid-reset-token-12345";
        String tokenHash = hashToken(rawToken);

        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(testUser)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build());

        ConfirmResetPasswordRequest request = ConfirmResetPasswordRequest.builder()
                .token(rawToken)
                .newPassword("newPassword123")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password has been successfully reset."));

        PasswordResetToken updatedToken = passwordResetTokenRepository.findByTokenHashAndUsedFalse(tokenHash).orElse(null);
        assertNull(updatedToken, "Token should no longer be returned by findByTokenHashAndUsedFalse");

        // Old password login should fail
        LoginRequest oldLogin = new LoginRequest();
        oldLogin.setUsernameOrEmail("testuser@example.com");
        oldLogin.setPassword("oldPassword123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oldLogin)))
                .andExpect(status().isUnauthorized());

        // New password login should succeed
        LoginRequest newLogin = new LoginRequest();
        newLogin.setUsernameOrEmail("testuser@example.com");
        newLogin.setPassword("newPassword123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("testuser@example.com"));
    }

    @Test
    @DisplayName("POST /api/auth/reset-password/confirm fails when token is reused (#17860)")
    void testConfirmPasswordResetTokenReuseFails() throws Exception {
        String rawToken = "reused-reset-token-99999";
        String tokenHash = hashToken(rawToken);

        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(testUser)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .used(true) // already used
                .build());

        ConfirmResetPasswordRequest request = ConfirmResetPasswordRequest.builder()
                .token(rawToken)
                .newPassword("newPassword123")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired password reset token"));
    }

    @Test
    @DisplayName("POST /api/auth/reset-password/confirm fails when token is expired (#17860)")
    void testConfirmPasswordResetExpiredTokenFails() throws Exception {
        String rawToken = "expired-reset-token-88888";
        String tokenHash = hashToken(rawToken);

        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(testUser)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().minusMinutes(5)) // expired
                .used(false)
                .build());

        ConfirmResetPasswordRequest request = ConfirmResetPasswordRequest.builder()
                .token(rawToken)
                .newPassword("newPassword123")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password reset token has expired"));
    }

    @Test
    @DisplayName("POST /api/auth/reset-password/confirm fails when token is invalid (#17860)")
    void testConfirmPasswordResetInvalidTokenFails() throws Exception {
        ConfirmResetPasswordRequest request = ConfirmResetPasswordRequest.builder()
                .token("non-existent-token")
                .newPassword("newPassword123")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired password reset token"));
    }

    @Test
    @DisplayName("POST /api/auth/reset-password never discloses the raw token or its hash (#17079)")
    void testRequestPasswordResetDoesNotExposeToken() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("testuser@example.com");

        String responseBody = mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("If an account exists for that email, a password reset link has been sent."))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);

        // The raw token (or any token-bearing field) must never appear in the HTTP response.
        assertFalse(responseBody.contains("token"),
                "Raw reset token must never be disclosed in the API response");
        assertFalse(responseBody.contains("resetToken"));
        assertFalse(responseBody.contains("tokenHash"));

        // Only a SHA-256 hex digest is persisted, never the raw token.
        PasswordResetToken stored = passwordResetTokenRepository.findAll().get(0);
        assertEquals(64, stored.getTokenHash().length());
        assertTrue(stored.getTokenHash().matches("[0-9a-f]{64}"));
    }

    @Test
    @DisplayName("POST /api/auth/reset-password/confirm consumes the token; a second use of the same token fails (#17079)")
    void testConfirmPasswordResetConsumesToken() throws Exception {
        String rawToken = "single-use-reset-token-77777";
        String tokenHash = hashToken(rawToken);

        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(testUser)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .used(false)
                .build());

        ConfirmResetPasswordRequest firstUse = ConfirmResetPasswordRequest.builder()
                .token(rawToken)
                .newPassword("firstNewPass123")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstUse)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password has been successfully reset."));

        // The same raw token is now invalidated: reset-password must consume, not regenerate.
        ConfirmResetPasswordRequest secondUse = ConfirmResetPasswordRequest.builder()
                .token(rawToken)
                .newPassword("secondNewPass123")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondUse)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired password reset token"));

        // The password set by the first (successful) use remains effective.
        LoginRequest login = new LoginRequest();
        login.setUsernameOrEmail("testuser@example.com");
        login.setPassword("firstNewPass123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("testuser@example.com"));
    }
}
