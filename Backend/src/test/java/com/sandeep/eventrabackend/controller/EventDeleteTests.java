package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.EventTeamMember;
import com.sandeep.eventrabackend.model.EventWaitlist;
import com.sandeep.eventrabackend.model.Feedback;
import com.sandeep.eventrabackend.model.Payment;
import com.sandeep.eventrabackend.model.PaymentPlan;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.EventTeamMemberRepository;
import com.sandeep.eventrabackend.repository.EventWaitlistRepository;
import com.sandeep.eventrabackend.repository.FeedbackAnalyticsRepository;
import com.sandeep.eventrabackend.repository.HackathonRegistrationRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.PaymentPlanRepository;
import com.sandeep.eventrabackend.repository.PaymentRepository;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EventDeleteTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private EventWaitlistRepository eventWaitlistRepository;

    @Autowired
    private EventTeamMemberRepository eventTeamMemberRepository;

    @Autowired
    private FeedbackAnalyticsRepository feedbackRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentPlanRepository paymentPlanRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Event existingEvent;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        paymentPlanRepository.deleteAll();
        notificationRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        feedbackRepository.deleteAll();
        eventWaitlistRepository.deleteAll();
        eventTeamMemberRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        // Create users
        userRepository.save(User.builder()
                .firstName("SuperAdmin")
                .lastName("User")
                .email("superadmin@example.com")
                .username("superadmin")
                .password(passwordEncoder.encode("password"))
                .role(Role.SUPER_ADMIN)
                .build());

        userRepository.save(User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@example.com")
                .username("admin")
                .password(passwordEncoder.encode("password"))
                .role(Role.ADMIN)
                .build());

        userRepository.save(User.builder()
                .firstName("Organizer")
                .lastName("User")
                .email("organizer@example.com")
                .username("organizer")
                .password(passwordEncoder.encode("password"))
                .role(Role.ORGANIZER)
                .build());

        userRepository.save(User.builder()
                .firstName("Client")
                .lastName("User")
                .email("client@example.com")
                .username("client")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        // Create an existing event
        Event event = new Event();
        event.setTitle("Event to delete");
        event.setDescription("Description");
        event.setLocation("Location");
        event.setEventDate(LocalDateTime.now().plusDays(5));
        event.setCapacity(100);
        event.setPublic(true);
        existingEvent = eventRepository.save(event);
    }

    @Test
    @DisplayName("ADMIN can delete event successfully")
    void deleteEvent_AsAdmin_Success() throws Exception {
        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("admin@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isNoContent());

        assertFalse(eventRepository.existsById(existingEvent.getId()));
    }

    @Test
    @DisplayName("SUPER_ADMIN can delete event successfully")
    void deleteEvent_AsSuperAdmin_Success() throws Exception {
        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("superadmin@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("SUPER_ADMIN"))))
                .andExpect(status().isNoContent());

        assertFalse(eventRepository.existsById(existingEvent.getId()));
    }

    @Test
    @DisplayName("Deletion cleans up registrations")
    void deleteEvent_CleansUpRegistrations() throws Exception {
        // Create a registration
        User client = userRepository.findByEmail("client@example.com").orElseThrow();
        EventRegistration registration = new EventRegistration();
        registration.setEvent(existingEvent);
        registration.setUser(client);
        registration.setStatus("CONFIRMED");
        eventRegistrationRepository.save(registration);

        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("admin@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isNoContent());

        assertFalse(eventRepository.existsById(existingEvent.getId()));
        assertFalse(eventRegistrationRepository.existsByEvent_IdAndUser_Email(existingEvent.getId(), client.getEmail()));
    }

    @Test
    @DisplayName("Deletion cleans up waitlist, team members and feedback as well")
    void deleteEvent_AsAdmin_CleansUpAllDependents() throws Exception {
        User client = userRepository.findByEmail("client@example.com").orElseThrow();

        EventWaitlist waitlist = new EventWaitlist();
        waitlist.setEvent(existingEvent);
        waitlist.setUser(client);
        waitlist.setPosition(1);
        waitlist.setStatus("WAITING");
        eventWaitlistRepository.save(waitlist);

        EventTeamMember teamMember = new EventTeamMember();
        teamMember.setEvent(existingEvent);
        teamMember.setUser(client);
        teamMember.setRole(EventRole.ORGANIZER);
        eventTeamMemberRepository.save(teamMember);

        Feedback feedback = new Feedback();
        feedback.setEvent(existingEvent);
        feedback.setUser(client);
        feedback.setRating(5);
        feedback.setComment("Great event");
        feedbackRepository.save(feedback);

        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("admin@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isNoContent());

        assertFalse(eventRepository.existsById(existingEvent.getId()));
        assertTrue(eventWaitlistRepository.findByEvent_IdAndStatusOrderByPositionAscJoinedAtAsc(existingEvent.getId(), "WAITING").isEmpty());
        assertTrue(eventTeamMemberRepository.findByEvent_IdOrderByRoleDescAssignedAtDesc(existingEvent.getId()).isEmpty());
        assertFalse(feedbackRepository.existsByEvent_IdAndUser_Email(existingEvent.getId(), client.getEmail()));
    }

    @Test
    @DisplayName("#18838 - deletion cleans up payment and payment plan rows")
    void deleteEvent_CleansUpPayments() throws Exception {
        User client = userRepository.findByEmail("client@example.com").orElseThrow();
        EventRegistration registration = new EventRegistration();
        registration.setEvent(existingEvent);
        registration.setUser(client);
        registration.setStatus("CONFIRMED");
        registration = eventRegistrationRepository.save(registration);

        Payment payment = new Payment();
        payment.setRegistration(registration);
        payment.setAmount(BigDecimal.valueOf(250.00));
        payment.setPaymentMethod("CARD");
        payment.setPaymentProvider("STRIPE");
        payment.setStatus("COMPLETED");
        paymentRepository.save(payment);

        PaymentPlan plan = new PaymentPlan();
        plan.setRegistration(registration);
        plan.setTotalAmount(BigDecimal.valueOf(250.00));
        plan.setInstallmentAmount(BigDecimal.valueOf(62.50));
        plan.setStatus("ACTIVE");
        paymentPlanRepository.save(plan);

        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("admin@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isNoContent());

        assertFalse(eventRepository.existsById(existingEvent.getId()));
        assertTrue(paymentRepository.findByRegistration_IdOrderByInstallmentNumberAsc(registration.getId()).isEmpty());
        assertTrue(paymentPlanRepository.findByRegistration_Id(registration.getId()).isEmpty());
    }

    @Test
    @DisplayName("ORGANIZER cannot delete event")
    void deleteEvent_AsOrganizer_Forbidden() throws Exception {
        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("organizer@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ORGANIZER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CLIENT cannot delete event")
    void deleteEvent_AsClient_Forbidden() throws Exception {
        mockMvc.perform(delete("/api/events/" + existingEvent.getId())
                        .with(user("client@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("CLIENT"))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Deleting non-existent event returns 404")
    void deleteEvent_NonExistent_NotFound() throws Exception {
        mockMvc.perform(delete("/api/events/999999")
                        .with(user("admin@example.com").authorities(new org.springframework.security.core.authority.SimpleGrantedAuthority("ADMIN"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Event not found with id: 999999"));
    }
}
