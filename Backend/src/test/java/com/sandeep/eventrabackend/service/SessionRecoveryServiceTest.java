package com.sandeep.eventrabackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.model.RecoverySession;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.RecoverySessionRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SessionRecoveryServiceTest {

    @Autowired
    private SessionRecoveryService sessionRecoveryService;

    @Autowired
    private RecoverySessionRepository recoverySessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User userA;
    private User userB;

    @BeforeEach
    void setUp() {
        recoverySessionRepository.deleteAll();
        userRepository.deleteAll();

        userA = userRepository.save(User.builder()
                .firstName("Alice")
                .lastName("Owner")
                .email("alice@example.com")
                .username("alice")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        userB = userRepository.save(User.builder()
                .firstName("Bob")
                .lastName("Attacker")
                .email("bob@example.com")
                .username("bob")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());
    }

    @Test
    @DisplayName("Owner can create and update their own recovery session")
    void ownerCanSaveOwnSession() {
        Map<String, Object> created = sessionRecoveryService.save(userA.getEmail(), Map.of(
                "sessionId", "owned-session",
                "draftData", Map.of("step", 1)
        ));
        assertEquals("owned-session", created.get("sessionId"));

        Map<String, Object> updated = sessionRecoveryService.save(userA.getEmail(), Map.of(
                "sessionId", "owned-session",
                "draftData", Map.of("step", 2)
        ));
        assertEquals("owned-session", updated.get("sessionId"));
        assertEquals(1, recoverySessionRepository.count());
    }

    @Test
    @DisplayName("Attacker cannot overwrite another user's recovery session by ID (#13583)")
    void attackerCannotOverwriteForeignSession() throws Exception {
        sessionRecoveryService.save(userA.getEmail(), Map.of(
                "sessionId", "steal-me",
                "draftData", Map.of("secret", true)
        ));

        AccessDeniedException denied = assertThrows(AccessDeniedException.class, () ->
                sessionRecoveryService.save(userB.getEmail(), Map.of(
                        "sessionId", "steal-me",
                        "draftData", Map.of("pwned", true)
                )));
        assertTrue(denied.getMessage().toLowerCase().contains("another user"));

        RecoverySession remaining = recoverySessionRepository.findById("steal-me").orElseThrow();
        assertEquals(userA.getId(), remaining.getUser().getId());
        assertEquals(Map.of("secret", true), objectMapper.readValue(remaining.getDraftData(), Map.class));
        assertTrue(remaining.getExpiresAt().isAfter(LocalDateTime.now()));
    }
}
