package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.Payment;
import com.sandeep.eventrabackend.model.PaymentPlan;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.service.EventRoleService;
import com.sandeep.eventrabackend.service.PaymentPlanService;
import com.sandeep.eventrabackend.service.StripeService;
import com.stripe.exception.StripeException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentPlanService paymentPlanService;

    @Autowired
    private StripeService stripeService;

    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;

    @Autowired
    private EventRoleService eventRoleService;

    /**
     * Create a new payment plan for installment payments
     */
    @PostMapping("/plans")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> createPaymentPlan(
            Authentication authentication,
            @RequestParam Long registrationId,
            @RequestParam(required = false, defaultValue = "1000.00") BigDecimal ticketPrice,
            @RequestParam(required = false, defaultValue = "USD") String currency,
            @RequestParam(required = false, defaultValue = "25") Integer upfrontPercentage,
            @RequestParam(required = false, defaultValue = "4") Integer totalInstallments) {

        paymentPlanService.requirePaymentAccessByRegistration(registrationId, authentication.getName());

        try {
            PaymentPlan paymentPlan = paymentPlanService.createPaymentPlan(
                    registrationId, ticketPrice, currency, upfrontPercentage, totalInstallments);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment plan created successfully",
                    "paymentPlanId", paymentPlan.getId(),
                    "upfrontAmount", paymentPlan.getUpfrontAmount(),
                    "installmentAmount", paymentPlan.getInstallmentAmount(),
                    "totalInstallments", paymentPlan.getTotalInstallments(),
                    "currency", paymentPlan.getCurrency()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Failed to create payment plan", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Failed to create payment plan"
            ));
        }
    }

    /**
     * Initialize Stripe customer and setup intent for a registration
     */
    @PostMapping("/initialize/{registrationId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> initializeStripePayment(
            Authentication authentication,
            @PathVariable Long registrationId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone) {

        paymentPlanService.requirePaymentAccessByRegistration(registrationId, authentication.getName());

        try {
            Map<String, String> result = paymentPlanService.initializeStripePayment(
                    registrationId, authentication.getName(), email, name, phone);
            
            return ResponseEntity.ok(result);
            
        } catch (StripeException e) {
            log.error("Stripe error during payment initialization", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Payment processing error"
            ));
        } catch (Exception e) {
            log.error("Failed to initialize Stripe payment", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Failed to initialize payment"
            ));
        }
    }

    /**
     * Setup payment method and create upfront payment intent
     */
    @PostMapping("/setup-method/{paymentPlanId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> setupPaymentMethodAndCreateUpfrontPayment(
            Authentication authentication,
            @PathVariable Long paymentPlanId,
            @RequestBody Map<String, String> request) {

        paymentPlanService.requirePaymentAccessByPlan(paymentPlanId, authentication.getName());

        String paymentMethodId = request.get("paymentMethodId");
        
        if (paymentMethodId == null || paymentMethodId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "paymentMethodId is required"
            ));
        }
        
        try {
            Map<String, String> result = paymentPlanService.setupPaymentMethodAndCreateUpfrontPayment(
                    paymentPlanId, paymentMethodId);
            
            return ResponseEntity.ok(result);
            
        } catch (StripeException e) {
            log.error("Stripe error during payment method setup", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Payment processing error"
            ));
        } catch (Exception e) {
            log.error("Failed to setup payment method", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Failed to setup payment method"
            ));
        }
    }

    /**
     * Confirm upfront payment and schedule remaining installments
     */
    @PostMapping("/confirm-upfront/{paymentPlanId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> confirmUpfrontPaymentAndScheduleInstallments(
            Authentication authentication,
            @PathVariable Long paymentPlanId,
            @RequestBody Map<String, String> request) {

        paymentPlanService.requirePaymentAccessByPlan(paymentPlanId, authentication.getName());

        String paymentMethodId = request.get("paymentMethodId");
        
        if (paymentMethodId == null || paymentMethodId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "paymentMethodId is required"
            ));
        }
        
        try {
            Map<String, Object> result = paymentPlanService.confirmUpfrontPaymentAndScheduleInstallments(
                    paymentPlanId, paymentMethodId);
            
            return ResponseEntity.ok(result);
            
        } catch (StripeException e) {
            log.error("Stripe error during upfront payment confirmation", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Payment processing error"
            ));
        } catch (Exception e) {
            log.error("Failed to confirm upfront payment", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Failed to confirm payment"
            ));
        }
    }

    /**
     * Get payment plan by registration ID
     */
    @GetMapping("/plans/{registrationId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> getPaymentPlanByRegistrationId(
            Authentication authentication,
            @PathVariable Long registrationId) {

        paymentPlanService.requirePaymentAccessByRegistration(registrationId, authentication.getName());

        try {
            Map<String, Object> status = paymentPlanService.getPaymentPlanStatus(registrationId);
            
            if (status == null) {
                // Check if registration has payment info directly
                Optional<EventRegistration> registrationOptional = 
                        eventRegistrationRepository.findById(registrationId);
                
                if (registrationOptional.isPresent()) {
                    EventRegistration registration = registrationOptional.get();
                    return ResponseEntity.ok(Map.of(
                            "hasPaymentPlan", false,
                            "paymentStatus", registration.getPaymentStatus(),
                            "ticketPrice", registration.getTicketPrice(),
                            "qrActivated", registration.isQrActivated()
                    ));
                }
                
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            log.error("Failed to retrieve payment plan status", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Failed to retrieve payment plan status"
            ));
        }
    }

    /**
     * Get all payments for a registration
     */
    @GetMapping("/registrations/{registrationId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> getPaymentsByRegistrationId(
            Authentication authentication,
            @PathVariable Long registrationId) {

        paymentPlanService.requirePaymentAccessByRegistration(registrationId, authentication.getName());

        try {
            List<Payment> payments = paymentPlanService.getPaymentsByRegistrationId(registrationId);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "payments", payments,
                    "count", payments.size()
            ));
            
        } catch (Exception e) {
            log.error("Failed to retrieve payments for registration {}", registrationId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Failed to retrieve payments"
            ));
        }
    }

    /**
     * Get installment schedule for a registration
     */
    @GetMapping("/schedule/{registrationId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> getInstallmentSchedule(
            Authentication authentication,
            @PathVariable Long registrationId) {

        paymentPlanService.requirePaymentAccessByRegistration(registrationId, authentication.getName());

        try {
            List<Map<String, Object>> schedule = paymentPlanService.getInstallmentSchedule(registrationId);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "schedule", schedule,
                    "count", schedule.size()
            ));
            
        } catch (Exception e) {
            log.error("Failed to retrieve installment schedule for registration {}", registrationId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Failed to retrieve installment schedule"
            ));
        }
    }

    /**
     * Retry a failed payment
     */
    @PostMapping("/retry/{paymentId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> retryFailedPayment(
            Authentication authentication,
            @PathVariable Long paymentId,
            @RequestParam(required = false) String paymentMethodId) {

        paymentPlanService.requirePaymentAccessByPayment(paymentId, authentication.getName());

        try {
            Map<String, Object> result = paymentPlanService.retryFailedPayment(paymentId, paymentMethodId);
            
            return ResponseEntity.ok(result);
            
        } catch (StripeException e) {
            log.error("Stripe error during payment retry", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Payment processing error"
            ));
        } catch (Exception e) {
            log.error("Failed to retry payment {}", paymentId, e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Failed to retry payment"
            ));
        }
    }

    /**
     * Get customer payment methods
     */
    @GetMapping("/methods/{registrationId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> getCustomerPaymentMethods(
            Authentication authentication,
            @PathVariable Long registrationId) {

        paymentPlanService.requirePaymentAccessByRegistration(registrationId, authentication.getName());

        try {
            List<Map<String, Object>> methods = paymentPlanService.getCustomerPaymentMethods(registrationId);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "paymentMethods", methods,
                    "count", methods.size()
            ));
            
        } catch (StripeException e) {
            log.error("Stripe error retrieving payment methods", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Payment processing error"
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve payment methods for registration {}", registrationId, e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Failed to retrieve payment methods"
            ));
        }
    }

    /**
     * Check if QR code is activated for a registration
     */
    @GetMapping("/qr-status/{registrationId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> isQRCodeActivated(
            Authentication authentication,
            @PathVariable Long registrationId) {

        paymentPlanService.requirePaymentAccessByRegistration(registrationId, authentication.getName());

        try {
            boolean activated = paymentPlanService.isQRCodeActivated(registrationId);
            boolean completed = paymentPlanService.isPaymentCompleted(registrationId);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "qrActivated", activated,
                    "paymentCompleted", completed
            ));
            
        } catch (Exception e) {
            log.error("Failed to check QR code status for registration {}", registrationId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Failed to check QR code status"
            ));
        }
    }

    /**
     * Cancel a payment plan
     */
    @DeleteMapping("/plans/{paymentPlanId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> cancelPaymentPlan(
            Authentication authentication,
            @PathVariable Long paymentPlanId,
            @RequestParam(required = false, defaultValue = "User request") String reason) {

        paymentPlanService.requirePaymentAccessByPlan(paymentPlanId, authentication.getName());

        try {
            paymentPlanService.cancelPaymentPlan(paymentPlanId, reason);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment plan cancelled successfully"
            ));
            
        } catch (Exception e) {
            log.error("Failed to cancel payment plan {}", paymentPlanId, e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Failed to cancel payment plan"
            ));
        }
    }

    /**
     * Check if registration has an active payment plan
     */
    @GetMapping("/active/{registrationId}")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> hasActivePaymentPlan(
            Authentication authentication,
            @PathVariable Long registrationId) {

        paymentPlanService.requirePaymentAccessByRegistration(registrationId, authentication.getName());

        try {
            boolean hasActive = paymentPlanService.hasActivePaymentPlan(registrationId);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "hasActivePaymentPlan", hasActive
            ));
            
        } catch (Exception e) {
            log.error("Failed to check active payment plan for registration {}", registrationId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Failed to check payment plan status"
            ));
        }
    }

    /**
     * Webhook endpoint for Stripe events
     * This endpoint should be configured with the Stripe webhook secret
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signatureHeader) {
        
        try {
            // Verify signature and construct the event ONCE (fails closed on
            // invalid/missing signature by throwing rather than returning false).
            com.stripe.model.Event event = stripeService.verifyWebhookSignature(payload, signatureHeader);

            String eventId = event.getId();

            // Idempotency: ignore retries of an already-processed Stripe event id
            // so duplicate records are not created.
            if (eventId != null && stripeService.isEventProcessed(eventId)) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Event already processed (idempotent ignore)"
                ));
            }

            // Handle different event types
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    com.stripe.model.PaymentIntent paymentIntent = (com.stripe.model.PaymentIntent) event.getData().getObject();
                    stripeService.handlePaymentIntentSucceeded(paymentIntent);
                    break;

                case "payment_intent.payment_failed":
                    com.stripe.model.PaymentIntent failedIntent = (com.stripe.model.PaymentIntent) event.getData().getObject();
                    stripeService.handlePaymentIntentFailed(failedIntent);
                    break;

                case "charge.succeeded":
                    // Handle successful charge
                    break;

                case "charge.failed":
                    // Handle failed charge
                    break;

                case "customer.subscription.created":
                    // Handle subscription created
                    break;

                case "invoice.payment_succeeded":
                    // Handle successful invoice payment
                    break;

                case "invoice.payment_failed":
                    // Handle failed invoice payment
                    break;

                default:
                    log.warn("Unhandled Stripe event type: {} (event id: {}) - acknowledged to avoid silent data loss on retry",
                            event.getType(), eventId);
            }

            // Record the event id as processed for idempotency (including
            // unhandled event types, which are acknowledged with 200).
            if (eventId != null) {
                stripeService.markEventProcessed(eventId);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Webhook processed successfully"
            ));

        } catch (StripeException e) {
            log.error("Stripe webhook signature verification failed", e);
            return ResponseEntity.status(400).body(Map.of(
                    "success", false,
                    "error", "Invalid webhook signature"
            ));
        } catch (Exception e) {
            log.error("Failed to process Stripe webhook", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Webhook processing failed"
            ));
        }
    }

    /**
     * Get payment statistics for an event (for organizers)
     */
    @GetMapping("/stats/event/{eventId}")
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getPaymentStatsForEvent(
            @PathVariable Long eventId,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        boolean hasAccess = eventRoleService.hasRole(eventId, authentication.getName(), EventRole.ORGANIZER);
        if (!hasAccess) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "error", "Access denied: You are not authorized to view payment statistics for this event."
            ));
        }

        try {
            // Implementation would query payment repository for event statistics
            // This is a placeholder that would be implemented based on specific requirements
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "eventId", eventId,
                    "message", "Payment statistics endpoint (implementation pending)"
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve payment statistics for event {}", eventId, e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Failed to retrieve payment statistics"
            ));
        }
    }

    /**
     * Get user's payment history
     */
    @GetMapping("/user/history")
    @PreAuthorize("hasAnyAuthority('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    public ResponseEntity<?> getUserPaymentHistory() {
        try {
            // Implementation would return payment history for the authenticated user
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User payment history endpoint (implementation pending)"
            ));
        } catch (Exception e) {
            log.error("Failed to retrieve user payment history", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Failed to retrieve payment history"
            ));
        }
    }
}
