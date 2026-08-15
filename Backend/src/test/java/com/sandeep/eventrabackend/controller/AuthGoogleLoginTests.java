package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.service.GoogleAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #12072 — Google OAuth returns a case-insensitive identity: the same
 * account must never be duplicated just because the token carries a different
 * email casing than the stored (lowercased) account. {@code AuthService.googleLogin}
 * lowercases the payload email before lookup; these tests pin that behaviour.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthGoogleLoginTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private GoogleAuthService googleAuthService;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Mixed-case Google email matches the existing lowercased account instead of creating a duplicate")
    void googleLogin_MixedCaseEmail_ReusesExistingAccount() throws Exception {
        userRepository.save(User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .username("john")
                .password(passwordEncoder.encode("secret"))
                .role(Role.CLIENT)
                .build());

        GoogleIdToken.Payload payload = verifiedGooglePayload("John@Example.COM", "John", "Doe");
        when(googleAuthService.verifyToken(anyString())).thenReturn(payload);

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("token", "google-id-token"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.username").value("john"));

        // The account must not have been duplicated by the casing change.
        assertEquals(1, userRepository.count());
    }

    @Test
    @DisplayName("Mixed-case Google email creates a single lowercased account when none exists")
    void googleLogin_MixedCaseEmail_CreatesLowercasedAccount() throws Exception {
        GoogleIdToken.Payload payload = verifiedGooglePayload("Jane@Example.COM", "Jane", "Smith");
        when(googleAuthService.verifyToken(anyString())).thenReturn(payload);

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("token", "google-id-token"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("jane@example.com"));

        assertEquals(1, userRepository.count());
        assertTrue(userRepository.findByEmail("jane@example.com").isPresent());
    }

    @Test
    @DisplayName("Verified Google identity must NOT claim an unverified LOCAL account for the same email")
    void googleLogin_UnverifiedLocal_IsRejected() throws Exception {
        String originalPasswordHash = passwordEncoder.encode("attacker-password");
        userRepository.save(User.builder()
                .firstName("Squatter")
                .lastName("Local")
                .email("claim@example.com")
                .username("squatter")
                .password(originalPasswordHash)
                .role(Role.ATTENDEE)
                .emailVerified(false)
                .authProvider("LOCAL")
                .build());

        when(googleAuthService.verifyToken(anyString()))
                .thenReturn(verifiedGooglePayload("claim@example.com", "Real", "Owner"));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("token", "google-id-token"))))
                .andExpect(status().isConflict());

        // The account must be left fully intact: no provider swap, no verification,
        // no password/profile overwrite, no login issued.
        User untouched = userRepository.findByEmail("claim@example.com").orElseThrow();
        assertEquals("LOCAL", untouched.getAuthProvider());
        assertFalse(untouched.isEmailVerified());
        assertTrue(passwordEncoder.matches("attacker-password", untouched.getPassword()));
        assertEquals("Squatter", untouched.getFirstName());
        assertEquals(1, userRepository.count());
    }

    @Test
    @DisplayName("Verified LOCAL accounts are not converted to Google on Google login")
    void googleLogin_VerifiedLocal_DoesNotTakeOver() throws Exception {
        String passwordHash = passwordEncoder.encode("owner-password");
        userRepository.save(User.builder()
                .firstName("Owner")
                .lastName("Local")
                .email("owner@example.com")
                .username("owner")
                .password(passwordHash)
                .role(Role.ATTENDEE)
                .emailVerified(true)
                .authProvider("LOCAL")
                .build());

        when(googleAuthService.verifyToken(anyString()))
                .thenReturn(verifiedGooglePayload("owner@example.com", "Other", "Person"));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("token", "google-id-token"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("owner@example.com"));

        User unchanged = userRepository.findByEmail("owner@example.com").orElseThrow();
        assertEquals("LOCAL", unchanged.getAuthProvider());
        assertTrue(unchanged.isEmailVerified());
        assertTrue(passwordEncoder.matches("owner-password", unchanged.getPassword()));
        assertEquals("Owner", unchanged.getFirstName());
    }

    private static GoogleIdToken.Payload verifiedGooglePayload(String email, String givenName, String familyName) {
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.put("email", email);
        payload.put("email_verified", true);
        payload.put("given_name", givenName);
        payload.put("family_name", familyName);
        return payload;
    }
}
