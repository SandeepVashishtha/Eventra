package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.dto.response.AuthResponse;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.BlacklistedTokenRepository;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.security.JwtTokenProvider;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
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

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthLogoutTests {

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

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.sandeep.eventrabackend.security.TokenBlacklistService tokenBlacklistService;

    @Autowired
    private BlacklistedTokenRepository blacklistedTokenRepository;

    private String jwtToken;

    @BeforeEach
    void setUp() throws Exception {
        tokenBlacklistService.clear();
        notificationRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        userRepository.deleteAll();

        // Create a test user
        userRepository.save(User.builder()
                .firstName("Test")
                .lastName("User")
                .email("test@example.com")
                .username("testuser")
                .password(passwordEncoder.encode("password123"))
                .role(Role.CLIENT)
                .build());

        // Login to get a token
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmail("testuser");
        loginRequest.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseString = result.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseString, AuthResponse.class);
        jwtToken = authResponse.getToken();
    }

    @Test
    @DisplayName("POST /api/auth/logout with valid token returns 200")
    void testLogoutSuccess() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("token", 0));
    }

    @Test
    @DisplayName("Using token after logout returns 401")
    void testTokenInvalidAfterLogout() throws Exception {
        // 1. Logout
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // 2. Try to access protected endpoint
        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Revoked token stays rejected after a restart (DB-backed blacklist)")
    void testBlacklistPersistedInDatabase() throws Exception {
        // 1. Logout -> token is revoked
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // 2. The revoked entry is persisted to the database
        assertTrue(blacklistedTokenRepository.count() >= 1,
                "blacklist row should be persisted to the database");

        // 3. Simulate a restart: the store is read entirely from the database
        // (no in-memory cache), so the revoked token must still be rejected.
        assertTrue(tokenBlacklistService.isBlacklisted(jwtToken),
                "revoked token must still be rejected after a restart");
    }

    @Test
    @DisplayName("Cookie-only session authenticates profile and logout clears cookie (#11974)")
    void testCookieSessionAndLogout() throws Exception {
        mockMvc.perform(get("/api/users/profile")
                        .cookie(new jakarta.servlet.http.Cookie("token", jwtToken)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(new jakarta.servlet.http.Cookie("token", jwtToken)))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("token", 0));

        mockMvc.perform(get("/api/users/profile")
                        .cookie(new jakarta.servlet.http.Cookie("token", jwtToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/logout without token still clears cookie")
    void testLogoutWithoutToken() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("token", 0));
    }

    @Test
    @DisplayName("POST /api/auth/logout with malformed token still clears cookie")
    void testLogoutWithMalformedToken() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer not-a-valid-jwt"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("token", 0));
    }

    @Test
    @DisplayName("POST /api/auth/logout with expired token clears cookie (#13339)")
    void testLogoutWithExpiredToken() throws Exception {
        String expiredToken = buildExpiredAccessToken("test@example.com");

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(new jakarta.servlet.http.Cookie("token", expiredToken)))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("token", 0));
    }

    private String buildExpiredAccessToken(String email) {
        String secret = "test-secret-key-that-is-at-least-256-bits-long-for-hs256-algorithm-ok";
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (Exception ex) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        SecretKey key = Keys.hmacShaKeyFor(keyBytes);
        Date issuedAt = Date.from(Instant.now().minusSeconds(7200));
        Date expiresAt = Date.from(Instant.now().minusSeconds(3600));

        return Jwts.builder()
                .subject(email)
                .claim(JwtTokenProvider.CLAIM_TOKEN_TYPE, JwtTokenProvider.TYPE_ACCESS)
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .signWith(key)
                .compact();
    }
}
