package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.dto.request.HackathonCreateRequest;
import com.sandeep.eventrabackend.model.Hackathon;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.HackathonRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class HackathonControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private HackathonRepository hackathonRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        hackathonRegistrationRepository.deleteAll();
        hackathonRepository.deleteAll();
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void createHackathon_ShouldReturnCreated_WhenAuthorized() throws Exception {
        HackathonCreateRequest request = HackathonCreateRequest.builder()
                .title("New Hackathon")
                .description("Desc")
                .organizer("Org")
                .startDate(LocalDateTime.now().plusDays(5))
                .endDate(LocalDateTime.now().plusDays(7))
                .location("Virtual")
                .mode("Online")
                .registrationDeadline(LocalDateTime.now().plusDays(2))
                .build();

        mockMvc.perform(post("/api/hackathons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("New Hackathon"));
    }

    @Test
    void createHackathon_ShouldReturn401_WhenUnauthenticated() throws Exception {
        HackathonCreateRequest request = HackathonCreateRequest.builder()
                .title("Unauthorized Hackathon")
                .build();

        mockMvc.perform(post("/api/hackathons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "CLIENT")
    void createHackathon_ShouldReturn403_WhenForbidden() throws Exception {
        HackathonCreateRequest request = HackathonCreateRequest.builder()
                .title("Forbidden Hackathon")
                .description("Desc")
                .organizer("Org")
                .startDate(LocalDateTime.now().plusDays(5))
                .endDate(LocalDateTime.now().plusDays(7))
                .location("Virtual")
                .mode("Online")
                .registrationDeadline(LocalDateTime.now().plusDays(2))
                .build();

        mockMvc.perform(post("/api/hackathons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void createHackathon_ShouldReturn400_WhenInvalidPayload() throws Exception {
        HackathonCreateRequest request = HackathonCreateRequest.builder()
                .title("") // Invalid
                .build();

        mockMvc.perform(post("/api/hackathons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAllHackathons_ShouldReturnEmptyList_WhenNoHackathonsExist() throws Exception {
        mockMvc.perform(get("/api/hackathons")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getAllHackathons_ShouldReturnHackathons_WhenHackathonsExist() throws Exception {
        Hackathon hackathon = Hackathon.builder()
                .title("Test Hackathon")
                .description("Test Description")
                .organizer("Test Organizer")
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(2))
                .location("Online")
                .mode("Online")
                .prizePool("$1000")
                .registrationDeadline(LocalDateTime.now().plusHours(12))
                .imageUrl("http://example.com/image.png")
                .build();

        hackathonRepository.save(hackathon);

        mockMvc.perform(get("/api/hackathons")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Test Hackathon"))
                .andExpect(jsonPath("$[0].organizer").value("Test Organizer"))
                .andExpect(jsonPath("$[0].location").value("Online"));
    }

    @Test
    void getHackathonById_ShouldReturnHackathon_WhenHackathonExists() throws Exception {
        Hackathon hackathon = Hackathon.builder()
                .title("Single Hackathon")
                .organizer("Organizer X")
                .build();
        hackathon = hackathonRepository.save(hackathon);

        mockMvc.perform(get("/api/hackathons/" + hackathon.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Single Hackathon"))
                .andExpect(jsonPath("$.organizer").value("Organizer X"));
    }

    @Test
    void getHackathonById_ShouldReturn404_WhenHackathonDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/hackathons/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Hackathon not found with id: 999"));
    }

    @Test
    void getHackathonById_ShouldBePubliclyAccessible() throws Exception {
        Hackathon hackathon = Hackathon.builder()
                .title("Public Hackathon")
                .organizer("Public Org")
                .build();
        hackathon = hackathonRepository.save(hackathon);

        mockMvc.perform(get("/api/hackathons/" + hackathon.getId()))
                .andExpect(status().isOk());
    }

    @Test
    void getAllHackathons_ShouldBePubliclyAccessible() throws Exception {
        // No authentication provided
        mockMvc.perform(get("/api/hackathons"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void deleteHackathon_ShouldReturn204_WhenAdmin() throws Exception {
        Hackathon hackathon = Hackathon.builder()
                .title("Delete Me")
                .organizer("Org")
                .build();
        hackathon = hackathonRepository.save(hackathon);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/hackathons/" + hackathon.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/hackathons/" + hackathon.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "SUPER_ADMIN")
    void deleteHackathon_ShouldReturn204_WhenSuperAdmin() throws Exception {
        Hackathon hackathon = Hackathon.builder()
                .title("Delete Me Super")
                .organizer("Org")
                .build();
        hackathon = hackathonRepository.save(hackathon);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/hackathons/" + hackathon.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(authorities = "ORGANIZER")
    void deleteHackathon_ShouldReturn403_WhenOrganizer() throws Exception {
        Hackathon hackathon = Hackathon.builder()
                .title("No Delete Organizer")
                .organizer("Org")
                .build();
        hackathon = hackathonRepository.save(hackathon);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/hackathons/" + hackathon.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteHackathon_ShouldReturn401_WhenUnauthenticated() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/hackathons/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void deleteHackathon_ShouldReturn404_WhenNotFound() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/hackathons/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Hackathon not found with id: 999"));
    }
}
