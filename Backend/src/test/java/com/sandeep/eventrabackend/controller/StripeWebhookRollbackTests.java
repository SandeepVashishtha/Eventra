package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.Payment;
import com.sandeep.eventrabackend.model.PaymentPlan;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.ratelimit.RedisTokenBucketLimiter;
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
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #17830 - Stripe webhook handlers must not swallow exceptions inside a
 * @Transactional method: a failed downstream write must roll back the whole
 * transaction and surface as HTTP 500 so Stripe retries, instead of committing
 * a partial state where the Payment is COMPLETED but the plan/registration were
 * never updated.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "stripe.webhook.secret=whsec_test_webhook_secret_for_17830")
class StripeWebhookRollbackTests {

    private static final String PAYMENT_INTENT_ID = "pi_test_17830";
    private static final String WEBHOOK_SECRET = "whsec_test_webhook_secret_for_17830";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private PaymentPlanRepository paymentPlanRepository;

    @MockBean
    private RedisTokenBucketLimiter redisTokenBucketLimiter;

    private Long registrationId;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        eventRegistrationRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();
        reset(paymentPlanRepository);
        when(redisTokenBucketLimiter.isAllowed(anyString(), anyInt())).thenReturn(true);

        User attendee = userRepository.save(User.builder()
                .firstName("Stripe")
                .lastName("Attendee")
                .email("stripeattendee@example.com")
                .username("stripeattendee")
                .password(passwordEncoder.encode("password"))
                .role(Role.CLIENT)
                .build());

        Event event = new Event();
        event.setTitle("Stripe Webhook Rollback Test Event");
        event.setCapacity(50);
        event.setEventDate(LocalDateTime.now().plusDays(10));
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
    @DisplayName("Webhook returns 500 and rolls back the Payment when the payment plan write fails")
    void failedPlanWriteReturns500AndDoesNotCommitPartialPayment() throws Exception {
        savePendingPayment();

        PaymentPlan plan = new PaymentPlan();
        plan.setRegistration(loadRegistration());
        plan.setTotalAmount(new BigDecimal("1000.00"));
        plan.setCurrency("USD");
        plan.setTotalInstallments(2);
        plan.setInstallmentAmount(new BigDecimal("375.00"));
        plan.setPaymentProvider("STRIPE");
        plan.setStatus("ACTIVE");

        when(paymentPlanRepository.findByRegistration_Id(registrationId)).thenReturn(Optional.of(plan));
        when(paymentPlanRepository.save(any(PaymentPlan.class)))
                .thenThrow(new RuntimeException("simulated database outage"));

        String payload = succeededWebhookPayload(2, 2);

        mockMvc.perform(post("/api/payments/webhook")
                        .with(user("stripe-webhook"))
                        .header("Stripe-Signature", signWebhook(payload))
                        .contentType("application/json")
                        .content(payload))
                .andExpect(status().isInternalServerError());

        Payment after = paymentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID).orElseThrow();
        assertNotEquals("COMPLETED", after.getStatus());
        assertEquals("PENDING", after.getStatus());
    }

    @Test
    @DisplayName("Webhook commits the Payment on the success path when the plan write succeeds")
    void successPathStillCommitsPayment() throws Exception {
        savePendingPayment();

        PaymentPlan plan = new PaymentPlan();
        plan.setRegistration(loadRegistration());
        plan.setTotalAmount(new BigDecimal("1000.00"));
        plan.setCurrency("USD");
        plan.setTotalInstallments(2);
        plan.setInstallmentAmount(new BigDecimal("375.00"));
        plan.setPaymentProvider("STRIPE");
        plan.setStatus("ACTIVE");

        when(paymentPlanRepository.findByRegistration_Id(registrationId)).thenReturn(Optional.of(plan));
        when(paymentPlanRepository.save(any(PaymentPlan.class))).thenReturn(plan);

        String payload = succeededWebhookPayload(2, 2);

        mockMvc.perform(post("/api/payments/webhook")
                        .with(user("stripe-webhook"))
                        .header("Stripe-Signature", signWebhook(payload))
                        .contentType("application/json")
                        .content(payload))
                .andExpect(status().isOk());

        Payment after = paymentRepository.findByStripePaymentIntentId(PAYMENT_INTENT_ID).orElseThrow();
        assertEquals("COMPLETED", after.getStatus());
    }

    private void savePendingPayment() {
        Payment payment = new Payment();
        payment.setRegistration(loadRegistration());
        payment.setStripePaymentIntentId(PAYMENT_INTENT_ID);
        payment.setAmount(new BigDecimal("250.00"));
        payment.setCurrency("USD");
        payment.setPaymentMethod("CARD");
        payment.setPaymentProvider("STRIPE");
        payment.setStatus("PENDING");
        payment.setInstallmentNumber(2);
        payment.setTotalInstallments(2);
        paymentRepository.save(payment);
    }

    private EventRegistration loadRegistration() {
        return eventRegistrationRepository.findById(registrationId).orElseThrow();
    }

    private String succeededWebhookPayload(int installmentNumber, int totalInstallments) {
        return "{\n"
                + "  \"id\": \"evt_test_17830\",\n"
                + "  \"object\": \"event\",\n"
                + "  \"type\": \"payment_intent.succeeded\",\n"
                + "  \"data\": {\n"
                + "    \"object\": {\n"
                + "      \"id\": \"" + PAYMENT_INTENT_ID + "\",\n"
                + "      \"object\": \"payment_intent\",\n"
                + "      \"amount\": 25000,\n"
                + "      \"currency\": \"usd\",\n"
                + "      \"metadata\": {\n"
                + "        \"registration_id\": \"" + registrationId + "\",\n"
                + "        \"installment_number\": \"" + installmentNumber + "\",\n"
                + "        \"total_installments\": \"" + totalInstallments + "\"\n"
                + "      }\n"
                + "    }\n"
                + "  }\n"
                + "}";
    }

    private String signWebhook(String payload) throws Exception {
        long timestamp = Instant.now().getEpochSecond();
        String signedPayload = timestamp + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String signature = HexFormat.of().formatHex(mac.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8)));
        return "t=" + timestamp + ",v1=" + signature;
    }
}
