package com.sandeep.eventrabackend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.dto.request.AdminUpdateRoleRequest;
import com.sandeep.eventrabackend.dto.request.AdminUpdateUserRequest;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.Payment;
import com.sandeep.eventrabackend.model.PaymentPlan;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.EventWaitlistRepository;
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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminPeerAdminGuardTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private EventWaitlistRepository eventWaitlistRepository;

    @Autowired
    private HackathonRegistrationRepository hackathonRegistrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentPlanRepository paymentPlanRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User adminA;
    private User adminB;
    private User organizer;
    private User superAdmin;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        paymentPlanRepository.deleteAll();
        notificationRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventWaitlistRepository.deleteAll();
        hackathonRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        adminA = userRepository.save(User.builder()
                .firstName("Admin")
                .lastName("A")
                .email("admin-a@example.com")
                .username("admina")
                .password(passwordEncoder.encode("password"))
                .role(Role.ADMIN)
                .build());

        adminB = userRepository.save(User.builder()
                .firstName("Admin")
                .lastName("B")
                .email("admin-b@example.com")
                .username("adminb")
                .password(passwordEncoder.encode("password"))
                .role(Role.ADMIN)
                .build());

        organizer = userRepository.save(User.builder()
                .firstName("Org")
                .lastName("User")
                .email("organizer@example.com")
                .username("organizer")
                .password(passwordEncoder.encode("password"))
                .role(Role.ORGANIZER)
                .build());

        superAdmin = userRepository.save(User.builder()
                .firstName("Super")
                .lastName("Admin")
                .email("superadmin@example.com")
                .username("superadmin")
                .password(passwordEncoder.encode("password"))
                .role(Role.SUPER_ADMIN)
                .build());
    }

    @Test
    @DisplayName("ADMIN cannot change peer ADMIN email (#13584)")
    void adminCannotChangePeerAdminEmail() throws Exception {
        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        request.setEmail("attacker@evil.com");

        mockMvc.perform(put("/api/admin/users/" + adminB.getId())
                        .with(user(adminA.getEmail()).authorities(() -> "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        assertEquals("admin-b@example.com", userRepository.findById(adminB.getId()).orElseThrow().getEmail());
    }

    @Test
    @DisplayName("ADMIN cannot assign ADMIN role (#13584)")
    void adminCannotAssignAdminRole() throws Exception {
        AdminUpdateRoleRequest request = new AdminUpdateRoleRequest();
        request.setRole("ADMIN");

        mockMvc.perform(put("/api/admin/users/" + organizer.getId() + "/role")
                        .with(user(adminA.getEmail()).authorities(() -> "ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        assertEquals(Role.ORGANIZER, userRepository.findById(organizer.getId()).orElseThrow().getRole());
    }

    @Test
    @DisplayName("ADMIN cannot delete peer ADMIN (#13584)")
    void adminCannotDeletePeerAdmin() throws Exception {
        mockMvc.perform(delete("/api/admin/users/" + adminB.getId())
                        .with(user(adminA.getEmail()).authorities(() -> "ADMIN")))
                .andExpect(status().isForbidden());

        assertEquals(true, userRepository.existsById(adminB.getId()));
    }

    @Test
    @DisplayName("#18838 - SUPER_ADMIN can delete a user whose registrations have payments")
    void superAdminCanDeleteUserWithPayments() throws Exception {
        User client = userRepository.save(User.builder()
                .firstName("Client")
                .lastName("User")
                .email("client@example.com")
                .username("client")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        Event event = new Event();
        event.setTitle("Paid event");
        event.setDescription("Description");
        event.setLocation("Location");
        event.setEventDate(LocalDateTime.now().plusDays(5));
        event.setPublic(true);
        event = eventRepository.save(event);

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
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

        mockMvc.perform(delete("/api/admin/users/" + client.getId())
                        .with(user(superAdmin.getEmail()).authorities(() -> "SUPER_ADMIN")))
                .andExpect(status().isNoContent());

        assertTrue(!userRepository.existsById(client.getId()));
        assertTrue(paymentRepository.findByRegistration_User_Id(client.getId()).isEmpty());
        assertTrue(paymentPlanRepository.findByRegistration_User_Id(client.getId()).isEmpty());
    }

    @Test
    @DisplayName("SUPER_ADMIN can update peer ADMIN email")
    void superAdminCanUpdateAdminEmail() throws Exception {
        AdminUpdateUserRequest request = new AdminUpdateUserRequest();
        request.setEmail("admin-b-new@example.com");

        mockMvc.perform(put("/api/admin/users/" + adminB.getId())
                        .with(user(superAdmin.getEmail()).authorities(() -> "SUPER_ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        assertEquals("admin-b-new@example.com", userRepository.findById(adminB.getId()).orElseThrow().getEmail());
    }
}
