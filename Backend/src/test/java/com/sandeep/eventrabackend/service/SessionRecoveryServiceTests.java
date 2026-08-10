package com.sandeep.eventrabackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.RecoverySessionRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionRecoveryServiceTests {

    @Mock
    private RecoverySessionRepository recoverySessionRepository;

    @Mock
    private UserRepository userRepository;

    private SessionRecoveryService sessionRecoveryService;

    @BeforeEach
    void setUp() {
        sessionRecoveryService = new SessionRecoveryService(
                recoverySessionRepository,
                userRepository,
                new ObjectMapper());
    }

    @Test
    void save_rejectsDraftDataOverMaxBytes() {
        User user = User.builder()
                .id(1L)
                .firstName("A")
                .lastName("B")
                .email("user@example.com")
                .username("user")
                .password("x")
                .role(Role.ATTENDEE)
                .build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(recoverySessionRepository.findByIdAndUser_Id(anyString(), anyLong()))
                .thenReturn(Optional.empty());

        String oversized = "x".repeat(SessionRecoveryService.MAX_DRAFT_BYTES + 1);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> sessionRecoveryService.save("user@example.com", Map.of(
                        "name", "Big Draft",
                        "type", "generic",
                        "draftData", Map.of("blob", oversized))));

        assertTrue(ex.getMessage().contains("draftData exceeds the maximum allowed size"));
        verify(recoverySessionRepository, never()).save(any());
    }
}
