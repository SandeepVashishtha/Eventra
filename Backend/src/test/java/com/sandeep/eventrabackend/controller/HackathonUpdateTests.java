package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.HackathonUpdateRequest;
import com.sandeep.eventrabackend.model.Hackathon;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.HackathonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class HackathonUpdateTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Hackathon existingHackathon;

    @BeforeEach
    void setUp() {
        hackathonRegistrationRepository.deleteAll();
        hackathonRepository.deleteAll();

        Hackathon hackathon = Hackathon.builder()
                .title("Original Title")
                .description("Original Description")
                .organizer("Original Organizer")
                .startDate(LocalDateTime.now().plusDays(5))
                .endDate(LocalDateTime.now().plusDays(7))
                .location("Original Location")
                .mode("Online")
                .registrationDeadline(LocalDateTime.now().plusDays(2))
                .build();
        existingHackathon = hackathonRepository.save(hackathon);
    }

    @Test
    @WithMockUser(authorities = "ORGANIZER")
    @DisplayName("ORGANIZER can update hackathon successfully")
    void testOrganizerCanUpdateHackathon() throws Exception {
        HackathonUpdateRequest request = HackathonUpdateRequest.builder()
                .title("Updated Title")
                .description("Updated Description")
                .organizer("Updated Organizer")
                .startDate(LocalDateTime.now().plusDays(10))
                .endDate(LocalDateTime.now().plusDays(12))
                .location("Updated Location")
                .mode("In-person")
                .registrationDeadline(LocalDateTime.now().plusDays(5))
                .prizePool("$5000")
                .imageUrl("http://example.com/updated.png")
                .build();

        mockMvc.perform(put("/api/hackathons/" + existingHackathon.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Updated Title"))
                .andExpect(jsonPath("$.location").value("Updated Location"))
                .andExpect(jsonPath("$.mode").value("In-person"))
                .andExpect(jsonPath("$.prizePool").value("$5000"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    @DisplayName("ADMIN can update hackathon successfully")
    void testAdminCanUpdateHackathon() throws Exception {
        HackathonUpdateRequest request = HackathonUpdateRequest.builder()
                .title("Admin Updated Title")
                .description("Desc")
                .organizer("Org")
                .startDate(LocalDateTime.now().plusDays(10))
                .endDate(LocalDateTime.now().plusDays(12))
                .location("Loc")
                .mode("Online")
                .registrationDeadline(LocalDateTime.now().plusDays(5))
                .build();

        mockMvc.perform(put("/api/hackathons/" + existingHackathon.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Admin Updated Title"));
    }

    @Test
    @DisplayName("Unauthenticated request returns 401 Unauthorized")
    void testUnauthenticatedUpdateReturns401() throws Exception {
        HackathonUpdateRequest request = HackathonUpdateRequest.builder()
                .title("Title")
                .description("Desc")
                .organizer("Org")
                .startDate(LocalDateTime.now().plusDays(10))
                .endDate(LocalDateTime.now().plusDays(12))
                .location("Loc")
                .mode("Online")
                .registrationDeadline(LocalDateTime.now().plusDays(5))
                .build();

        mockMvc.perform(put("/api/hackathons/" + existingHackathon.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "CLIENT")
    @DisplayName("CLIENT role returns 403 Forbidden")
    void testClientRoleReturns403() throws Exception {
        HackathonUpdateRequest request = HackathonUpdateRequest.builder()
                .title("Title")
                .description("Desc")
                .organizer("Org")
                .startDate(LocalDateTime.now().plusDays(10))
                .endDate(LocalDateTime.now().plusDays(12))
                .location("Loc")
                .mode("Online")
                .registrationDeadline(LocalDateTime.now().plusDays(5))
                .build();

        mockMvc.perform(put("/api/hackathons/" + existingHackathon.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    @DisplayName("Non-existent hackathon id returns 404 Not Found")
    void testUpdateNonExistentHackathonReturns404() throws Exception {
        HackathonUpdateRequest request = HackathonUpdateRequest.builder()
                .title("Title")
                .description("Desc")
                .organizer("Org")
                .startDate(LocalDateTime.now().plusDays(10))
                .endDate(LocalDateTime.now().plusDays(12))
                .location("Loc")
                .mode("Online")
                .registrationDeadline(LocalDateTime.now().plusDays(5))
                .build();

        mockMvc.perform(put("/api/hackathons/9999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Hackathon not found with id: 9999"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    @DisplayName("Invalid payload returns 400 Bad Request")
    void testUpdateWithInvalidPayloadReturns400() throws Exception {
        HackathonUpdateRequest request = HackathonUpdateRequest.builder()
                .title("") // Blank title
                .description("Desc")
                .organizer("Org")
                .startDate(LocalDateTime.now().minusDays(1)) // Past date
                .endDate(LocalDateTime.now().plusDays(12))
                .location("Loc")
                .mode("Online")
                .registrationDeadline(LocalDateTime.now().plusDays(5))
                .build();

        mockMvc.perform(put("/api/hackathons/" + existingHackathon.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
