package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.UserProfileUpdateRequest;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserProfileUpdateTests {

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

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        userRepository.deleteAll();

        User u1 = User.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .username("johndoe")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(u1);

        User u2 = User.builder()
                .firstName("Jane")
                .lastName("Smith")
                .email("jane@example.com")
                .username("janesmith")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(u2);
    }

    @Test
    @DisplayName("PUT /api/users/profile - Success")
    void testUpdateUserProfile_Success() throws Exception {
        UserProfileUpdateRequest request = UserProfileUpdateRequest.builder()
                .firstName("Johnny")
                .lastName("Updated")
                .username("johnny_up")
                .build();

        mockMvc.perform(put("/api/users/profile")
                        .with(user("john@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Johnny"))
                .andExpect(jsonPath("$.lastName").value("Updated"))
                .andExpect(jsonPath("$.username").value("johnny_up"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.role").value("CLIENT"));

        User updatedUser = userRepository.findByEmail("john@example.com").orElseThrow();
        assertEquals("Johnny", updatedUser.getFirstName());
        assertEquals("Updated", updatedUser.getLastName());
        assertEquals("johnny_up", updatedUser.getUsername());
    }

    @Test
    @DisplayName("PUT /api/users/profile - Unauthorized")
    void testUpdateUserProfile_Unauthorized() throws Exception {
        UserProfileUpdateRequest request = UserProfileUpdateRequest.builder()
                .firstName("Johnny")
                .lastName("Updated")
                .username("johnny_up")
                .build();

        mockMvc.perform(put("/api/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/users/profile - User Not Found")
    void testUpdateUserProfile_NotFound() throws Exception {
        UserProfileUpdateRequest request = UserProfileUpdateRequest.builder()
                .firstName("Johnny")
                .lastName("Updated")
                .username("johnny_up")
                .build();

        mockMvc.perform(put("/api/users/profile")
                        .with(user("missing@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User not found with email: missing@example.com"));
    }

    @Test
    @DisplayName("PUT /api/users/profile - Duplicate Username")
    void testUpdateUserProfile_DuplicateUsername() throws Exception {
        UserProfileUpdateRequest request = UserProfileUpdateRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .username("janesmith") // already used by jane@example.com
                .build();

        mockMvc.perform(put("/api/users/profile")
                        .with(user("john@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Username already exists: janesmith"));

        User user = userRepository.findByEmail("john@example.com").orElseThrow();
        assertEquals("johndoe", user.getUsername());
    }

    @Test
    @DisplayName("PUT /api/users/profile - Same Username (No Conflict)")
    void testUpdateUserProfile_SameUsername() throws Exception {
        UserProfileUpdateRequest request = UserProfileUpdateRequest.builder()
                .firstName("Johnny")
                .lastName("Doe")
                .username("johndoe") // same as current
                .build();

        mockMvc.perform(put("/api/users/profile")
                        .with(user("john@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("johndoe"));
    }

    @Test
    @DisplayName("PUT /api/users/profile - Validation Failure")
    void testUpdateUserProfile_ValidationFailure() throws Exception {
        UserProfileUpdateRequest request = UserProfileUpdateRequest.builder()
                .firstName("") // Blank
                .lastName("Doe")
                .username("j") // Too short
                .build();

        mockMvc.perform(put("/api/users/profile")
                        .with(user("john@example.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Error"));
    }
}
