package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.service.EventService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EventCategoryStatisticsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private EventService eventService;

    @BeforeEach
    void setUp() {
        hackathonRegistrationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();

        // 3 Tech events
        createEvent("Tech Conf 1", "Tech");
        createEvent("Tech Conf 2", "Tech");
        createEvent("Tech Hackathon", "Tech");

        // 2 Music events
        createEvent("Music Festival 1", "Music");
        createEvent("Music Festival 2", "Music");

        // 1 Sports event
        createEvent("Sports Meet", "Sports");

        // 1 Event with null category (should be ignored in counts)
        createEvent("Uncategorized Event", null);
    }

    private void createEvent(String title, String category) {
        Event event = new Event();
        event.setTitle(title);
        event.setCategory(category);
        event.setPublic(true);
        event.setEventDate(LocalDateTime.now().plusDays(1));
        eventRepository.save(event);
    }

    @Test
    @DisplayName("Service method getEventCountByCategory returns grouped counts directly from DB")
    void testServiceGetEventCountByCategory() {
        Map<String, Long> categoryCounts = eventService.getEventCountByCategory();

        assertEquals(3, categoryCounts.size());
        assertEquals(3L, categoryCounts.get("Tech"));
        assertEquals(2L, categoryCounts.get("Music"));
        assertEquals(1L, categoryCounts.get("Sports"));
        assertFalse(categoryCounts.containsKey(null));
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/events/categories/summary returns 200 with category count map")
    void testGetEventCategorySummaryEndpoint() throws Exception {
        mockMvc.perform(get("/api/events/categories/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.Tech").value(3))
                .andExpect(jsonPath("$.Music").value(2))
                .andExpect(jsonPath("$.Sports").value(1));
    }
}
