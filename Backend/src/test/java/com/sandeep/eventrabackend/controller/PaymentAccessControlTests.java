package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.PaymentPlanRepository;
import com.sandeep.eventrabackend.repository.PaymentRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.sandeep.eventrabackend.service.PaymentPlanService;
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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #16252 — payment endpoints must enforce object-level authorization.
 * A caller may only access payment data for a registration they own or whose
 * event they organize; any other authenticated user gets 403.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PaymentAccessControlTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentPlanRepository paymentPlanRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PaymentPlanService paymentPlanService;

    private Long registrationId;
    private Long planId;
    private Long paymentId;
    private final String organizerEmail = "payorganizer@example.com";
    private final String attendeeEmail = "payattendee@example.com";
    private final String attackerEmail = "payattacker@example.com";

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        paymentPlanRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        User organizer = userRepository.save(User.builder()
                .firstName("Pay")
                .lastName("Organizer")
                .email(organizerEmail)
                .username("payorganizer")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        User attendee = userRepository.save(User.builder()
                .firstName("Pay")
                .lastName("Attendee")
                .email(attendeeEmail)
                .username("payattendee")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        userRepository.save(User.builder()
                .firstName("Pay")
                .lastName("Attacker")
                .email(attackerEmail)
                .username("payattacker")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        Event event = new Event();
        event.setTitle("Payment Access Test Event");
        event.setCapacity(50);
        event.setEventDate(LocalDateTime.now().plusDays(10));
        event.setOwnerId(organizer.getId());
        event.setPublic(true);
        event = eventRepository.save(event);

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(attendee);
        registration.setStatus("CONFIRMED");
        registration = eventRegistrationRepository.save(registration);
        registrationId = registration.getId();

        planId = paymentPlanService.createPaymentPlan(
                registrationId, new BigDecimal("1000.00"), "USD", 25, 4).getId();
        paymentId = paymentRepository.findByRegistration_IdOrderByInstallmentNumberAsc(registrationId)
                .get(0)
                .getId();
    }

    @Test
    @DisplayName("Registration owner can read plan, schedule, QR and active-plan state")
    void ownerCanReadOwnPaymentData() throws Exception {
        mockMvc.perform(get("/api/payments/plans/{id}", registrationId).with(user(attendeeEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/payments/registrations/{id}", registrationId).with(user(attendeeEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/payments/schedule/{id}", registrationId).with(user(attendeeEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/payments/qr-status/{id}", registrationId).with(user(attendeeEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/payments/active/{id}", registrationId).with(user(attendeeEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Event organizer can access a participant's payment data")
    void organizerCanReadParticipantPaymentData() throws Exception {
        mockMvc.perform(get("/api/payments/plans/{id}", registrationId).with(user(organizerEmail).authorities(Role.ORGANIZER.name())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Unrelated user is denied on every payment endpoint (403)")
    void attackerIsDeniedEverywhere() throws Exception {
        mockMvc.perform(get("/api/payments/plans/{id}", registrationId).with(user(attackerEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/payments/registrations/{id}", registrationId).with(user(attackerEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/payments/schedule/{id}", registrationId).with(user(attackerEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/payments/methods/{id}", registrationId).with(user(attackerEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/payments/qr-status/{id}", registrationId).with(user(attackerEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/payments/active/{id}", registrationId).with(user(attackerEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Unrelated user cannot create or cancel another user's payment plan (403)")
    void attackerCannotCreateOrCancelPlans() throws Exception {
        mockMvc.perform(post("/api/payments/plans")
                        .with(user(attackerEmail).authorities(Role.ATTENDEE.name()))
                        .param("registrationId", String.valueOf(registrationId)))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/payments/plans/{id}", planId).with(user(attackerEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/payments/setup-method/{planId}", planId)
                        .with(user(attackerEmail).authorities(Role.ATTENDEE.name()))
                        .contentType("application/json")
                        .content("{\"paymentMethodId\":\"pm_123\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/payments/confirm-upfront/{planId}", planId)
                        .with(user(attackerEmail).authorities(Role.ATTENDEE.name()))
                        .contentType("application/json")
                        .content("{\"paymentMethodId\":\"pm_123\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/payments/retry/{paymentId}", paymentId).with(user(attackerEmail).authorities(Role.ATTENDEE.name())))
                .andExpect(status().isForbidden());
    }
}
