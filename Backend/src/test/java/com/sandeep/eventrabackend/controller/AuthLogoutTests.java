package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.LoginRequest;
import com.sandeep.eventrabackend.dto.response.AuthResponse;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.TokenBlacklistRepository;
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
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    private TokenBlacklistRepository tokenBlacklistRepository;

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
                .andExpect(status().isOk());
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
    @DisplayName("Revoked token stays rejected after in-memory cache is lost (DB-backed)")
    void testBlacklistPersistedInDatabase() throws Exception {
        // 1. Logout -> token is revoked
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // 2. The revoked entry is persisted to the database
        assertTrue(tokenBlacklistRepository.count() >= 1,
                "blacklist row should be persisted to the database");

        // 3. Simulate a restart: drop the in-memory cache
        java.lang.reflect.Field cache = com.sandeep.eventrabackend.security.TokenBlacklistService.class
                .getDeclaredField("blacklist");
        cache.setAccessible(true);
        @SuppressWarnings("unchecked")
        java.util.Map<String, ?> inMemory = (java.util.Map<String, ?>) cache.get(tokenBlacklistService);
        inMemory.clear();

        // 4. The token is still rejected, served from the persisted store
        assertTrue(tokenBlacklistService.isBlacklisted(jwtToken),
                "revoked token must still be rejected after the in-memory cache is lost");
    }

    @Test
    @DisplayName("POST /api/auth/logout without token returns 401")
    void testLogoutWithoutToken() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/logout with malformed token returns 401")
    void testLogoutWithMalformedToken() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "InvalidFormat " + jwtToken))
                .andExpect(status().isUnauthorized());
    }
}
