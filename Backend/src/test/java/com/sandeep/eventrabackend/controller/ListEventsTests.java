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

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ListEventsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @BeforeEach
    void setUp() {
        hackathonRegistrationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();

        Event event1 = new Event();
        event1.setTitle("First Event");
        event1.setPublic(true);
        event1.setEventDate(LocalDateTime.now().plusDays(1));
        eventRepository.save(event1);

        Event event2 = new Event();
        event2.setTitle("Second Event");
        event2.setPublic(false);
        event2.setEventDate(LocalDateTime.now().plusDays(2));
        eventRepository.save(event2);

        Event event3 = new Event();
        event3.setTitle("Alpha Conference");
        event3.setDescription("Searchable description");
        event3.setLocation("Delhi");
        event3.setPublic(true);
        event3.setEventDate(LocalDateTime.now().plusDays(5));
        eventRepository.save(event3);
    }

    @Test
    @WithMockUser
    void testGetAllEventsReturnsPublicPageOnly() throws Exception {
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.first").value(true))
                .andExpect(jsonPath("$.last").value(true))
                .andExpect(jsonPath("$.content[0].title").exists());
    }

    @Test
    @WithMockUser
    void testGetAllEventsRespectsPagination() throws Exception {
        mockMvc.perform(get("/api/events")
                        .param("page", "0")
                        .param("size", "1")
                        .param("sort", "title,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2))
                .andExpect(jsonPath("$.content[0].title").value("Alpha Conference"))
                .andExpect(jsonPath("$.last").value(false));
    }

    @Test
    @WithMockUser
    void testGetAllEventsSearch() throws Exception {
        mockMvc.perform(get("/api/events").param("search", "Alpha"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].title").value("Alpha Conference"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
