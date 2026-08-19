package com.sandeep.eventrabackend.controller;

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
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PaymentPlanPriceTests {

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

    private final String organizerEmail = "priceorganizer@example.com";
    private final String attendeeEmail = "priceattendee@example.com";
    private User attendee;
    private Long organizerId;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        paymentPlanRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        User organizer = userRepository.save(User.builder()
                .firstName("Price")
                .lastName("Organizer")
                .email(organizerEmail)
                .username("priceorganizer")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        attendee = userRepository.save(User.builder()
                .firstName("Price")
                .lastName("Attendee")
                .email(attendeeEmail)
                .username("priceattendee")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        organizerId = organizer.getId();
    }

    private EventRegistration createRegistration(BigDecimal ticketPrice) {
        Event event = new Event();
        event.setTitle("Payment Plan Price Test Event");
        event.setCapacity(50);
        event.setEventDate(LocalDateTime.now().plusDays(10));
        event.setOwnerId(organizerId);
        event.setPublic(true);
        event = eventRepository.save(event);

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(attendee);
        registration.setStatus("CONFIRMED");
        registration.setTicketPrice(ticketPrice);
        return eventRegistrationRepository.save(registration);
    }

    @Test
    @DisplayName("Plan amount equals the stored ticket price; client price/terms params are ignored")
    void planPricedFromStoredTicketPrice() throws Exception {
        EventRegistration registration = createRegistration(new BigDecimal("500.00"));

        mockMvc.perform(post("/api/payments/plans")
                        .with(user(attendeeEmail).authorities(new SimpleGrantedAuthority("ATTENDEE")))
                        .param("registrationId", String.valueOf(registration.getId()))
                        .param("ticketPrice", "0.01")
                        .param("currency", "EUR")
                        .param("upfrontPercentage", "1")
                        .param("totalInstallments", "2"))
                .andExpect(status().isOk());

        PaymentPlan plan = paymentPlanRepository.findByRegistration_Id(registration.getId()).orElseThrow();
        assertThat(plan.getTotalAmount()).isEqualByComparingTo(new BigDecimal("500.00"));
        assertThat(plan.getUpfrontAmount()).isEqualByComparingTo(new BigDecimal("125.00"));
        assertThat(plan.getCurrency()).isEqualTo("USD");

        EventRegistration reloaded = eventRegistrationRepository.findById(registration.getId()).orElseThrow();
        assertThat(reloaded.getTicketPrice()).isEqualByComparingTo(new BigDecimal("500.00"));
    }

    @Test
    @DisplayName("Plan creation fails when the registration has no server-side price configured")
    void planRejectedWithoutConfiguredPrice() throws Exception {
        EventRegistration registration = createRegistration(null);

        mockMvc.perform(post("/api/payments/plans")
                        .with(user(attendeeEmail).authorities(new SimpleGrantedAuthority("ATTENDEE")))
                        .param("registrationId", String.valueOf(registration.getId()))
                        .param("ticketPrice", "0.01"))
                .andExpect(status().isInternalServerError());

        assertThat(paymentPlanRepository.findByRegistration_Id(registration.getId())).isEmpty();
    }
}
