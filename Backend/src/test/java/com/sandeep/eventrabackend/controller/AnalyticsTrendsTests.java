package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.service.AnalyticsService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression tests for the analytics trend and peak-period queries running on
 * the default H2 database. The queries must only rely on Hibernate HQL
 * built-ins (YEAR/MONTH/HOUR, CAST to date) that Hibernate translates for any
 * dialect, so they no longer call H2-only SQL functions via FUNCTION(...)
 * (#12612).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AnalyticsTrendsTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @PersistenceContext
    private EntityManager entityManager;

    private LocalDateTime monthA;
    private LocalDateTime monthB;
    private LocalDateTime recentDay;

    @BeforeEach
    void setUp() {
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        User admin = User.builder()
                .firstName("Ada")
                .lastName("Admin")
                .email("admin@example.com")
                .username("adaadmin")
                .password(passwordEncoder.encode("password"))
                .role(Role.SUPER_ADMIN)
                .build();
        userRepository.save(admin);

        User attendee = User.builder()
                .firstName("Sam")
                .lastName("Attendee")
                .email("sam@example.com")
                .username("samattendee")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        userRepository.save(attendee);

        Event event = new Event();
        event.setTitle("Tech Conference 2026");
        event.setDescription("A deep dive into AI and Cloud computing.");
        event.setLocation("San Francisco, CA");
        event.setEventDate(LocalDateTime.now().plusDays(10));
        eventRepository.save(event);

        // Registrations whose timestamps are planted directly in the DB because
        // @CreationTimestamp would otherwise overwrite any value set on the entity.
        // Each registration gets its own attendee: the (event, user) pair is
        // unique per the DB constraint UK_EVENT_REGISTRATION_EVENT_USER_INDEX_3.
        LocalDateTime now = LocalDateTime.now();
        monthA = now.minusMonths(2).withDayOfMonth(1).withHour(10).withMinute(5).withSecond(0).withNano(0);
        monthB = now.minusMonths(1).withDayOfMonth(1).withHour(9).withMinute(15).withSecond(0).withNano(0);
        recentDay = now.minusDays(3).withHour(11).withMinute(30).withSecond(0).withNano(0);

        saveRegistration(event, monthA);                    // pair A (hour 10)
        saveRegistration(event, monthA.plusHours(2));       // pair A (hour 12)
        saveRegistration(event, monthB);                    // pair B (hour 9)
        saveRegistration(event, monthB.plusMinutes(30));    // pair B (hour 9)
        saveRegistration(event, recentDay);                 // single (hour 11)
    }

    private int attendeeSeq = 0;

    private void saveRegistration(Event event, LocalDateTime registeredAt) {
        User attendee = User.builder()
                .firstName("Sam")
                .lastName("Attendee")
                .email("sam" + attendeeSeq + "@example.com")
                .username("samattendee" + attendeeSeq)
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build();
        attendeeSeq++;
        userRepository.save(attendee);
        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(attendee);
        registration.setStatus("CONFIRMED");
        eventRegistrationRepository.save(registration);

        plantRegisteredAt(registration, registeredAt);
    }

    private void plantRegisteredAt(EventRegistration registration, LocalDateTime registeredAt) {
        new TransactionTemplate(transactionManager).executeWithoutResult(status ->
                entityManager.createNativeQuery(
                                "UPDATE event_registrations SET registered_at = :ts WHERE id = :id")
                        .setParameter("ts", registeredAt)
                        .setParameter("id", registration.getId())
                        .executeUpdate());
    }

    @Test
    @DisplayName("GET /api/analytics/registrations/trends?granularity=monthly - buckets by month on H2")
    void testMonthlyTrend() throws Exception {
        mockMvc.perform(get("/api/analytics/registrations/trends")
                        .param("granularity", "monthly")
                        .param("periods", "12")
                        .with(user("admin@example.com").authorities(() -> "SUPER_ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].period").value(
                        monthA.getYear() + "-" + String.format("%02d", monthA.getMonthValue())))
                .andExpect(jsonPath("$[0].registrationCount").value(2))
                .andExpect(jsonPath("$[1].period").value(
                        monthB.getYear() + "-" + String.format("%02d", monthB.getMonthValue())))
                .andExpect(jsonPath("$[1].registrationCount").value(2))
                .andExpect(jsonPath("$[2].registrationCount").value(1))
                .andExpect(jsonPath("$[2].cumulativeTotal").value(5));
    }

    @Test
    @DisplayName("GET /api/analytics/registrations/trends?granularity=weekly - buckets by ISO week on H2")
    void testWeeklyTrend() throws Exception {
        mockMvc.perform(get("/api/analytics/registrations/trends")
                        .param("granularity", "weekly")
                        .param("periods", "12")
                        .with(user("admin@example.com").authorities(() -> "SUPER_ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].registrationCount").value(2))
                .andExpect(jsonPath("$[1].registrationCount").value(2))
                .andExpect(jsonPath("$[2].registrationCount").value(1))
                .andExpect(jsonPath("$[2].cumulativeTotal").value(5));
    }

    @Test
    @DisplayName("GET /api/analytics/registrations/trends?granularity=daily - buckets by date on H2")
    void testDailyTrend() throws Exception {
        mockMvc.perform(get("/api/analytics/registrations/trends")
                        .param("granularity", "daily")
                        .param("periods", "365")
                        .with(user("admin@example.com").authorities(() -> "SUPER_ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].registrationCount").value(2))
                .andExpect(jsonPath("$[1].registrationCount").value(2))
                .andExpect(jsonPath("$[2].registrationCount").value(1))
                .andExpect(jsonPath("$[2].cumulativeTotal").value(5));
    }

    @Test
    @DisplayName("Peak registration periods - derived from day+hour on H2, sorted descending")
    @WithMockUser("admin@example.com")
    void testPeakPeriods() {
        List<Map<String, Object>> peaks = analyticsService.getPeakPeriods();

        assertTrue(!peaks.isEmpty(), "expected at least one peak bucket");
        assertTrue(peaks.size() <= 10, "at most ten peak buckets");
        assertEquals(2L, ((Number) peaks.get(0).get("count")).longValue(),
                "the two same-hour registrations must form the top bucket");

        long previous = Long.MAX_VALUE;
        for (Map<String, Object> peak : peaks) {
            String day = (String) peak.get("dayOfWeek");
            assertTrue(List.of("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat").contains(day),
                    "dayOfWeek must be a valid weekday but was " + day);
            assertTrue(((String) peak.get("hour")).matches("\\d{2}:00"),
                    "hour must be formatted HH:00 but was " + peak.get("hour"));
            long count = ((Number) peak.get("count")).longValue();
            assertTrue(count <= previous, "buckets must be sorted by count descending");
            previous = count;
        }
    }
}
