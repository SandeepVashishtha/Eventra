package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Hackathon;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.HackathonRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
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

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class HackathonRegistrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Long hackathonId;
    private final String testUserEmail = "testuser@example.com";

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        hackathonRepository.deleteAll();
        userRepository.deleteAll();

        Hackathon hackathon = Hackathon.builder()
                .title("Test Hackathon")
                .description("A test hackathon")
                .organizer("Test Org")
                .startDate(LocalDateTime.now().plusDays(5))
                .endDate(LocalDateTime.now().plusDays(7))
                .location("Online")
                .mode("Online")
                .registrationDeadline(LocalDateTime.now().plusDays(2))
                .build();
        hackathon = hackathonRepository.save(hackathon);
        hackathonId = hackathon.getId();

        User user = User.builder()
                .firstName("Test")
                .lastName("User")
                .email(testUserEmail)
                .username("testuser")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(user);
    }

    @Test
    @DisplayName("POST /api/hackathons/{id}/register - Success (201)")
    void testRegistrationSuccess() throws Exception {
        mockMvc.perform(post("/api/hackathons/" + hackathonId + "/register")
                        .with(user(testUserEmail)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hackathonId").value(hackathonId))
                .andExpect(jsonPath("$.hackathonTitle").value("Test Hackathon"))
                .andExpect(jsonPath("$.userEmail").value(testUserEmail))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.registeredAt").exists());
    }

    @Test
    @DisplayName("POST /api/hackathons/{id}/register - Unauthorized (401)")
    void testRegistrationUnauthorized() throws Exception {
        mockMvc.perform(post("/api/hackathons/" + hackathonId + "/register"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/hackathons/{id}/register - Not Found (404)")
    void testRegistrationNotFound() throws Exception {
        mockMvc.perform(post("/api/hackathons/9999/register")
                        .with(user(testUserEmail)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/hackathons/{id}/register - Duplicate Registration (409)")
    void testDuplicateRegistration() throws Exception {
        // First registration
        mockMvc.perform(post("/api/hackathons/" + hackathonId + "/register")
                        .with(user(testUserEmail)))
                .andExpect(status().isCreated());

        // Second registration
        mockMvc.perform(post("/api/hackathons/" + hackathonId + "/register")
                        .with(user(testUserEmail)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("You are already registered for this hackathon."));
    }

    @Test
    @DisplayName("POST /api/hackathons/{id}/register - After Deadline (400)")
    void testRegistrationAfterDeadline() throws Exception {
        Hackathon pastHackathon = Hackathon.builder()
                .title("Past Hackathon")
                .organizer("Past Org")
                .registrationDeadline(LocalDateTime.now().minusDays(1))
                .build();
        pastHackathon = hackathonRepository.save(pastHackathon);

        mockMvc.perform(post("/api/hackathons/" + pastHackathon.getId() + "/register")
                        .with(user(testUserEmail)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Registration deadline has passed for this hackathon."));
    }

    @Test
    @DisplayName("DELETE /api/hackathons/{id} - Should also delete registrations")
    void testDeleteHackathonCleanup() throws Exception {
        // Register user
        mockMvc.perform(post("/api/hackathons/" + hackathonId + "/register")
                        .with(user(testUserEmail)))
                .andExpect(status().isCreated());

        // Delete hackathon (using with(user(...).authorities(...)) to simulate ADMIN)
        mockMvc.perform(delete("/api/hackathons/" + hackathonId)
                        .with(user("admin").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isNoContent());

        // Verify hackathon is gone
        mockMvc.perform(get("/api/hackathons/" + hackathonId))
                .andExpect(status().isNotFound());

        // Verify registrations are gone
        assertEquals(0, hackathonRegistrationRepository.count());
    }
}
