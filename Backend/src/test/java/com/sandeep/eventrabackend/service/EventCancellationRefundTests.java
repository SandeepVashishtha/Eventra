package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.CancelEventRequest;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.Payment;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.EventRoleAuditLogRepository;
import com.sandeep.eventrabackend.repository.EventTeamMemberRepository;
import com.sandeep.eventrabackend.repository.EventWaitlistRepository;
import com.sandeep.eventrabackend.repository.FeedbackAnalyticsRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.PaymentRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.stripe.model.Refund;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventCancellationRefundTests {

    @Mock
    private EventRepository eventRepository;
    @Mock
    private EventRegistrationRepository eventRegistrationRepository;
    @Mock
    private EventWaitlistRepository eventWaitlistRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private EventTeamMemberRepository eventTeamMemberRepository;
    @Mock
    private FeedbackAnalyticsRepository feedbackRepository;
    @Mock
    private EventRoleAuditLogRepository eventRoleAuditLogRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EventRoleService eventRoleService;
    @Mock
    private EventStreamService eventStreamService;
    @Mock
    private StripeService stripeService;
    @Mock
    private PaymentRepository paymentRepository;

    private EventService eventService;

    private Event event;
    private EventRegistration registration;
    private Payment installmentOne;
    private Payment installmentTwo;

    @BeforeEach
    void setUp() {
        eventService = new EventService(
                eventRepository,
                eventRegistrationRepository,
                eventWaitlistRepository,
                notificationRepository,
                eventTeamMemberRepository,
                feedbackRepository,
                eventRoleAuditLogRepository,
                userRepository,
                eventRoleService,
                eventStreamService,
                stripeService,
                paymentRepository);

        event = new Event();
        event.setId(1L);
        event.setTitle("Paid event");
        event.setDescription("A paid event with an installment plan");
        event.setLocation("Location");
        event.setEventDate(java.time.LocalDateTime.now().plusDays(5));
        event.setCapacity(100);
        event.setPublic(true);

        User attendee = User.builder()
                .firstName("Attendee")
                .lastName("One")
                .email("attendee@example.com")
                .username("attendee")
                .build();

        registration = new EventRegistration();
        registration.setId(1L);
        registration.setUser(attendee);
        registration.setPaymentStatus("COMPLETED");

        installmentOne = payment("pi_installment_1", 1, BigDecimal.valueOf(25.00));
        installmentTwo = payment("pi_installment_2", 2, BigDecimal.valueOf(25.00));

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenReturn(event);
        when(eventRegistrationRepository.findByEvent_IdAndStatus(1L, "CONFIRMED"))
                .thenReturn(List.of(registration));
        when(eventWaitlistRepository
                .findByEvent_IdAndStatusOrderByPositionAscJoinedAtAsc(1L, "WAITING"))
                .thenReturn(List.of());
        when(paymentRepository.findCompletedPaymentsByRegistrationId(anyLong()))
                .thenReturn(List.of(installmentOne, installmentTwo));
    }

    @Test
    @DisplayName("FULL cancellation refunds every captured installment, not just the upfront one (#18839)")
    void fullRefundRefundsEveryInstallment() throws Exception {
        event.setRefundPolicy("FULL");
        when(stripeService.refundPayment("pi_installment_1", "FULL", null)).thenReturn(new Refund());
        when(stripeService.refundPayment("pi_installment_2", "FULL", null)).thenReturn(new Refund());

        eventService.cancelEvent(1L, "admin@example.com",
                CancelEventRequest.builder().reason("weather").refundPolicy("FULL").build());

        verify(stripeService).refundPayment("pi_installment_1", "FULL", null);
        verify(stripeService).refundPayment("pi_installment_2", "FULL", null);

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository, times(2)).save(paymentCaptor.capture());
        assertEquals("REFUNDED", paymentCaptor.getAllValues().get(0).getStatus());
        assertEquals("REFUNDED", paymentCaptor.getAllValues().get(1).getStatus());
    }

    @Test
    @DisplayName("PARTIAL cancellation refunds the configured percentage of every installment (#18839)")
    void partialRefundRefundsEachInstallmentProportionally() throws Exception {
        event.setRefundPolicy("PARTIAL");
        event.setRefundPercent(50);
        when(stripeService.refundPayment("pi_installment_1", "PARTIAL", 50)).thenReturn(new Refund());
        when(stripeService.refundPayment("pi_installment_2", "PARTIAL", 50)).thenReturn(new Refund());

        eventService.cancelEvent(1L, "admin@example.com",
                CancelEventRequest.builder().reason("weather")
                        .refundPolicy("PARTIAL").refundPercent(50).build());

        verify(stripeService).refundPayment("pi_installment_1", "PARTIAL", 50);
        verify(stripeService).refundPayment("pi_installment_2", "PARTIAL", 50);

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository, times(2)).save(paymentCaptor.capture());
        assertEquals("REFUNDED", paymentCaptor.getAllValues().get(0).getStatus());
        assertEquals("REFUNDED", paymentCaptor.getAllValues().get(1).getStatus());
    }

    @Test
    @DisplayName("a failed refund does not mark the payment REFUNDED (#18839)")
    void failedRefundLeavesPaymentStatusUntouched() throws Exception {
        event.setRefundPolicy("FULL");
        when(stripeService.refundPayment("pi_installment_1", "FULL", null)).thenReturn(new Refund());
        when(stripeService.refundPayment("pi_installment_2", "FULL", null))
                .thenThrow(new RuntimeException("stripe down"));

        eventService.cancelEvent(1L, "admin@example.com",
                CancelEventRequest.builder().reason("weather").refundPolicy("FULL").build());

        ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
        verify(paymentRepository).save(paymentCaptor.capture());
        assertEquals("REFUNDED", paymentCaptor.getValue().getStatus());
        verify(paymentRepository, never()).save(eq(installmentTwo));
        assertEquals("COMPLETED", installmentTwo.getStatus());
    }

    @Test
    @DisplayName("legacy single payment without a Payment row still refunds the registration intent (#18839)")
    void legacySinglePaymentFallsBackToRegistrationIntent() throws Exception {
        event.setRefundPolicy("FULL");
        registration.setStripePaymentIntentId("pi_upfront");
        when(paymentRepository.findCompletedPaymentsByRegistrationId(anyLong())).thenReturn(List.of());
        when(stripeService.refundPayment("pi_upfront", "FULL", null)).thenReturn(new Refund());

        eventService.cancelEvent(1L, "admin@example.com",
                CancelEventRequest.builder().reason("weather").refundPolicy("FULL").build());

        verify(stripeService).refundPayment("pi_upfront", "FULL", null);
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    private Payment payment(String intentId, int installmentNumber, BigDecimal amount) {
        Payment payment = new Payment();
        payment.setStripePaymentIntentId(intentId);
        payment.setInstallmentNumber(installmentNumber);
        payment.setTotalInstallments(2);
        payment.setStatus("COMPLETED");
        payment.setAmount(amount);
        payment.setPaymentProvider("STRIPE");
        payment.setPaymentMethod("card");
        payment.setRegistration(registration);
        return payment;
    }
}
