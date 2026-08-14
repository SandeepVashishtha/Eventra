package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.PaymentPlan;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.PaymentPlanRepository;
import com.sandeep.eventrabackend.repository.PaymentRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Issue #18802 - a registration that already has a non-cancelled payment plan
 * (active or completed) must not be allowed to create another plan, otherwise a
 * completed registration could be re-opened for a second charge cycle.
 */
@SpringBootTest
@ActiveProfiles("test")
class PaymentPlanDuplicateTests {

    @Autowired
    private PaymentPlanService paymentPlanService;

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

    private Long registrationId;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        paymentPlanRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        User attendee = userRepository.save(User.builder()
                .firstName("Dup")
                .lastName("Attendee")
                .email("dupattendee@example.com")
                .username("dupattendee")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        Event event = new Event();
        event.setTitle("Payment Plan Duplicate Test Event");
        event.setCapacity(50);
        event.setEventDate(LocalDateTime.now().plusDays(30));
        event.setOwnerId(attendee.getId());
        event.setPublic(true);
        event = eventRepository.save(event);

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(attendee);
        registration.setStatus("CONFIRMED");
        registration = eventRegistrationRepository.save(registration);
        registrationId = registration.getId();
    }

    @Test
    @DisplayName("Re-creating a plan for an ACTIVE plan is rejected and creates no duplicates")
    void activePlanCannotBeDuplicated() {
        PaymentPlan first = paymentPlanService.createPaymentPlan(
                registrationId, new BigDecimal("1000.00"), "USD", 25, 4);

        assertThrows(IllegalStateException.class, () ->
                paymentPlanService.createPaymentPlan(
                        registrationId, new BigDecimal("1000.00"), "USD", 25, 4));

        assertEquals(first.getId(), paymentPlanRepository.findByRegistration_Id(registrationId)
                .orElseThrow().getId());
        assertEquals(1, paymentPlanRepository.count());
        assertEquals(4, paymentRepository.findByRegistration_IdOrderByInstallmentNumberAsc(registrationId).size());
    }

    @Test
    @DisplayName("Re-creating a plan for a COMPLETED plan is rejected, preventing double charging")
    void completedPlanCannotBeDuplicated() {
        PaymentPlan first = paymentPlanService.createPaymentPlan(
                registrationId, new BigDecimal("1000.00"), "USD", 25, 4);
        paymentPlanService.markPaymentPlanAsCompleted(first.getId());

        assertThrows(IllegalStateException.class, () ->
                paymentPlanService.createPaymentPlan(
                        registrationId, new BigDecimal("1000.00"), "USD", 25, 4));

        assertEquals(1, paymentPlanRepository.count());
        assertEquals("COMPLETED", paymentPlanRepository.findByRegistration_Id(registrationId)
                .orElseThrow().getStatus());
        assertEquals(4, paymentRepository.findByRegistration_IdOrderByInstallmentNumberAsc(registrationId).size());
    }

    @Test
    @DisplayName("A new plan is allowed after the previous plan was CANCELLED")
    void cancelledPlanMayBeRecreated() {
        PaymentPlan first = paymentPlanService.createPaymentPlan(
                registrationId, new BigDecimal("1000.00"), "USD", 25, 4);
        paymentPlanService.cancelPaymentPlan(first.getId(), "User request");

        PaymentPlan replacement = paymentPlanService.createPaymentPlan(
                registrationId, new BigDecimal("1000.00"), "USD", 25, 4);

        assertEquals(2, paymentPlanRepository.count());
        assertTrue(replacement.isActive());
        assertTrue(first.isCancelled());
    }
}
