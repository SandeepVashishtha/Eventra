package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class GetEventByIdTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    private Long publicEventId;
    private Long privateEventId;

    @BeforeEach
    void setUp() {
        hackathonRegistrationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();

        Event publicEvent = new Event();
        publicEvent.setTitle("Public Event");
        publicEvent.setPublic(true);
        publicEvent.setEventDate(LocalDateTime.now().plusDays(1));
        publicEvent = eventRepository.save(publicEvent);
        publicEventId = publicEvent.getId();

        Event privateEvent = new Event();
        privateEvent.setTitle("Private Event");
        privateEvent.setPublic(false);
        privateEvent.setEventDate(LocalDateTime.now().plusDays(2));
        privateEvent = eventRepository.save(privateEvent);
        privateEventId = privateEvent.getId();
    }

    @Test
    @WithMockUser
    void testGetPublicEventById() throws Exception {
        mockMvc.perform(get("/api/events/" + publicEventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Public Event"))
                .andExpect(jsonPath("$.public").value(true));
    }

    @Test
    @WithMockUser
    void testGetPrivateEventById() throws Exception {
        // This should pass after implementation. Currently it might fail (return 404).
        mockMvc.perform(get("/api/events/" + privateEventId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Private Event"))
                .andExpect(jsonPath("$.public").value(false));
    }

    @Test
    @WithMockUser
    void testGetNonExistentEventById() throws Exception {
        mockMvc.perform(get("/api/events/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Event not found with id: 999999"));
    }
}
