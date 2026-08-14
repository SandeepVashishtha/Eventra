package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.model.*;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.PaymentPlanRepository;
import com.sandeep.eventrabackend.repository.PaymentRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import com.stripe.exception.StripeException;
import org.springframework.security.access.AccessDeniedException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PaymentPlanService {

    private final PaymentPlanRepository paymentPlanRepository;
    private final PaymentRepository paymentRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final StripeService stripeService;
    private final UserRepository userRepository;
    private final EventRoleService eventRoleService;

    public PaymentPlanService(PaymentPlanRepository paymentPlanRepository,
                              PaymentRepository paymentRepository,
                              EventRegistrationRepository eventRegistrationRepository,
                              StripeService stripeService,
                              UserRepository userRepository,
                              EventRoleService eventRoleService) {
        this.paymentPlanRepository = paymentPlanRepository;
        this.paymentRepository = paymentRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.stripeService = stripeService;
        this.userRepository = userRepository;
        this.eventRoleService = eventRoleService;
    }

    // Create a new payment plan for installment payments
    @Transactional
    public PaymentPlan createPaymentPlan(Long registrationId) {
        
        // Get registration
        EventRegistration registration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));

        // Idempotency: return the existing active plan for this registration if present
        // to prevent duplicate Payment records and potential double-charging.
        Optional<PaymentPlan> existingActivePlan =
                paymentPlanRepository.findActivePaymentPlanByRegistrationId(registrationId);
        if (existingActivePlan.isPresent()) {
            return existingActivePlan.get();
        }

        // The registration's stored ticket price is the server-side source of truth:
        // the plan amount is derived from it and client-supplied prices are never used.
        BigDecimal ticketPrice = registration.getTicketPrice();
        if (ticketPrice == null || ticketPrice.signum() <= 0) {
            throw new IllegalStateException(
                    "No valid ticket price configured for this registration");
        }
        
        int upfrontPercentage = 25; // Default to 25%
        int totalInstallments = 4; // Default to 4 installments (25% + 3 monthly)
        
        // Calculate amounts
        BigDecimal upfrontAmount = ticketPrice.multiply(new BigDecimal(upfrontPercentage))
                .divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
        BigDecimal remainingAmount = ticketPrice.subtract(upfrontAmount);
        BigDecimal installmentAmount = remainingAmount.divide(new BigDecimal(totalInstallments - 1), 2, RoundingMode.HALF_UP);
        
        // Create payment plan
        PaymentPlan paymentPlan = new PaymentPlan();
        paymentPlan.setRegistration(registration);
        paymentPlan.setTotalAmount(ticketPrice);
        paymentPlan.setCurrency("USD");
        paymentPlan.setTotalInstallments(totalInstallments);
        paymentPlan.setInstallmentAmount(installmentAmount);
        paymentPlan.setUpfrontPercentage(upfrontPercentage);
        paymentPlan.setPaymentProvider("STRIPE");
        paymentPlan.setStatus("ACTIVE");
        paymentPlan.setStartDate(LocalDateTime.now());
        
        // Calculate next payment date (upfront is immediate, next is first installment)
        LocalDateTime eventDate = registration.getEvent().getEventDate();
        LocalDateTime now = LocalDateTime.now();
        
        if (eventDate != null && now.isBefore(eventDate)) {
            long totalDays = java.time.temporal.ChronoUnit.DAYS.between(now.toLocalDate(), eventDate.toLocalDate());
            long daysUntilFirstInstallment = totalDays / (totalInstallments - 1);
            paymentPlan.setNextPaymentDate(now.plusDays(daysUntilFirstInstallment));
        }
        
        paymentPlanRepository.save(paymentPlan);
        
        // Update registration
        registration.setPaymentStatus("PARTIAL");
        registration.setPaymentProvider("STRIPE");
        registration.setQrActivated(false);
        eventRegistrationRepository.save(registration);
        
        // Create payment records
        createPaymentRecords(paymentPlan);
        
        return paymentPlan;
    }

    // Create payment records for each installment
    private void createPaymentRecords(PaymentPlan paymentPlan) {
        EventRegistration registration = paymentPlan.getRegistration();
        LocalDateTime eventDate = registration.getEvent().getEventDate();
        LocalDateTime now = LocalDateTime.now();
        
        BigDecimal upfrontAmount = paymentPlan.getUpfrontAmount();
        BigDecimal installmentAmount = paymentPlan.getInstallmentAmount();
        
        // Upfront payment (installment 1)
        Payment upfrontPayment = new Payment();
        upfrontPayment.setRegistration(registration);
        upfrontPayment.setAmount(upfrontAmount);
        upfrontPayment.setCurrency(paymentPlan.getCurrency());
        upfrontPayment.setPaymentMethod("CARD");
        upfrontPayment.setPaymentProvider("STRIPE");
        upfrontPayment.setStatus("PENDING");
        upfrontPayment.setInstallmentNumber(1);
        upfrontPayment.setTotalInstallments(paymentPlan.getTotalInstallments());
        upfrontPayment.setDueDate(now);
        paymentRepository.save(upfrontPayment);
        
        // Remaining installments
        long totalDays = eventDate != null
                ? java.time.temporal.ChronoUnit.DAYS.between(now.toLocalDate(), eventDate.toLocalDate())
                : 0;
        int numInstallments = paymentPlan.getTotalInstallments() - 1;

        // Ensure installments + upfront sum exactly to ticketPrice: the last
        // installment absorbs the rounding difference from the base amount.
        BigDecimal remainingAmount = paymentPlan.getTotalAmount().subtract(upfrontAmount);
        BigDecimal lastInstallmentAmount = remainingAmount.subtract(
                installmentAmount.multiply(new BigDecimal(numInstallments - 1)));

        for (int i = 2; i <= paymentPlan.getTotalInstallments(); i++) {
            Payment payment = new Payment();
            payment.setRegistration(registration);
            payment.setAmount(i == paymentPlan.getTotalInstallments() ? lastInstallmentAmount : installmentAmount);
            payment.setCurrency(paymentPlan.getCurrency());
            payment.setPaymentMethod("CARD");
            payment.setPaymentProvider("STRIPE");
            payment.setStatus("PENDING");
            payment.setInstallmentNumber(i);
            payment.setTotalInstallments(paymentPlan.getTotalInstallments());

            // Calculate due date: spread total days evenly so the schedule spans
            // the full period without dropping remainder days (proportional spacing).
            long dueDayOffset = (totalDays * (i - 1)) / numInstallments;
            LocalDateTime dueDate = now.plusDays(dueDayOffset);
            if (eventDate != null && dueDate.isAfter(eventDate)) {
                dueDate = eventDate;
            }
            payment.setDueDate(dueDate);

            paymentRepository.save(payment);
        }
    }

    // Initialize Stripe customer and setup intent for a payment plan
    @Transactional
    public Map<String, String> initializeStripePayment(
            Long registrationId,
            String authenticatedEmail,
            String email,
            String name,
            String phone) throws StripeException {

        User currentUser = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));

        PaymentPlan paymentPlan = paymentPlanRepository.findByRegistration_Id(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Payment plan not found"));

        EventRegistration registration = paymentPlan.getRegistration();

        // Enforce object-level authorization: the authenticated user must own the registration
        if (!registration.getUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You are not authorized to initialize payment for this registration");
        }

        // Override request-controlled values with the authenticated user's verified details
        String customerEmail = currentUser.getEmail();
        String customerName = ((currentUser.getFirstName() != null ? currentUser.getFirstName() : "") + " "
                + (currentUser.getLastName() != null ? currentUser.getLastName() : "")).trim();
        String customerPhone = phone;

        // Create metadata
        Map<String, String> metadata = new HashMap<>();
        metadata.put("registration_id", String.valueOf(registrationId));
        metadata.put("event_id", String.valueOf(registration.getEvent().getId()));
        metadata.put("user_id", String.valueOf(registration.getUser().getId()));
        metadata.put("payment_plan_id", String.valueOf(paymentPlan.getId()));

        // Create Stripe customer
        Customer customer = stripeService.createCustomer(customerEmail, customerName, customerPhone, metadata);
        
        // Update payment plan with Stripe customer ID
        paymentPlan.setStripeCustomerId(customer.getId());
        paymentPlanRepository.save(paymentPlan);
        
        // Update registration with Stripe customer ID
        registration.setStripeCustomerId(customer.getId());
        eventRegistrationRepository.save(registration);
        
        // Create setup intent for saving payment method
        com.stripe.model.SetupIntent setupIntent = stripeService.createSetupIntent(
                customer.getId(), "card");
        
        // Update payment plan with setup intent ID
        paymentPlan.setStripeSetupIntentId(setupIntent.getId());
        paymentPlanRepository.save(paymentPlan);
        
        Map<String, String> response = new HashMap<>();
        response.put("customerId", customer.getId());
        response.put("setupIntentId", setupIntent.getId());
        response.put("clientSecret", setupIntent.getClientSecret());
        response.put("paymentPlanId", String.valueOf(paymentPlan.getId()));
        
        return response;
    }

    // Setup payment method and create upfront payment intent
    @Transactional
    public Map<String, String> setupPaymentMethodAndCreateUpfrontPayment(
            Long paymentPlanId,
            String paymentMethodId) throws StripeException {
        
        PaymentPlan paymentPlan = paymentPlanRepository.findById(paymentPlanId)
                .orElseThrow(() -> new IllegalArgumentException("Payment plan not found"));
        
        EventRegistration registration = paymentPlan.getRegistration();
        
        // Attach payment method to customer
        PaymentMethod paymentMethod = stripeService.attachPaymentMethod(
                paymentMethodId, paymentPlan.getStripeCustomerId());
        
        // Update payment plan
        paymentPlan.setStripePaymentMethodId(paymentMethod.getId());
        paymentPlanRepository.save(paymentPlan);
        
        // Update registration
        registration.setPaymentMethod("CARD");
        registration.setStripePaymentIntentId("pending");
        eventRegistrationRepository.save(registration);
        
        // Calculate upfront amount in cents
        BigDecimal upfrontAmount = paymentPlan.getUpfrontAmount();
        long upfrontAmountCents = stripeService.formatAmountForStripe(upfrontAmount);
        
        // Create metadata
        Map<String, String> metadata = new HashMap<>();
        metadata.put("registration_id", String.valueOf(registration.getId()));
        metadata.put("event_id", String.valueOf(registration.getEvent().getId()));
        metadata.put("user_id", String.valueOf(registration.getUser().getId()));
        metadata.put("payment_plan_id", String.valueOf(paymentPlan.getId()));
        metadata.put("installment_number", "1");
        metadata.put("total_installments", String.valueOf(paymentPlan.getTotalInstallments()));
        metadata.put("payment_type", "installment_upfront");
        
        // Create payment intent for upfront payment
        PaymentIntent paymentIntent = stripeService.createPaymentIntentWithoutConfirmation(
                paymentPlan.getStripeCustomerId(),
                upfrontAmountCents,
                paymentPlan.getCurrency().toLowerCase(),
                "Upfront payment for " + registration.getEvent().getTitle(),
                metadata
        );
        
        // Update first payment record with Stripe payment intent ID
        Optional<Payment> upfrontPayment = paymentRepository.findByRegistration_IdAndInstallmentNumber(
                registration.getId(), 1);
        if (upfrontPayment.isPresent()) {
            Payment payment = upfrontPayment.get();
            payment.setStripePaymentIntentId(paymentIntent.getId());
            payment.setStripeCustomerId(paymentPlan.getStripeCustomerId());
            paymentRepository.save(payment);
        }

        Map<String, String> response = new HashMap<>();
        response.put("paymentIntentId", paymentIntent.getId());
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("paymentMethodId", paymentMethod.getId());
        response.put("upfrontAmount", String.valueOf(upfrontAmount));
        response.put("currency", paymentPlan.getCurrency());
        
        return response;
    }

    // Confirm upfront payment and schedule remaining installments
    @Transactional
    public Map<String, Object> confirmUpfrontPaymentAndScheduleInstallments(
            Long paymentPlanId,
            String paymentMethodId) throws StripeException {
        
        PaymentPlan paymentPlan = paymentPlanRepository.findById(paymentPlanId)
                .orElseThrow(() -> new IllegalArgumentException("Payment plan not found"));
        
        EventRegistration registration = paymentPlan.getRegistration();
        
        // Get the upfront payment intent
        Optional<Payment> upfrontPayment = paymentRepository.findByRegistration_IdAndInstallmentNumber(
                registration.getId(), 1);
        
        if (upfrontPayment.isEmpty()) {
            throw new IllegalArgumentException("Upfront payment not found");
        }
        
        Payment payment = upfrontPayment.get();
        
        // Confirm the payment intent
        PaymentIntent paymentIntent = stripeService.confirmPaymentIntent(
                payment.getStripePaymentIntentId(), paymentMethodId);
        
        // Update payment status
        if ("succeeded".equals(paymentIntent.getStatus())) {
            payment.setStatus("COMPLETED");
            payment.setPaidAt(LocalDateTime.now());
            payment.setTransactionId(paymentIntent.getLatestChargeObject() != null ?
                    paymentIntent.getLatestChargeObject().getId() : null);
            paymentRepository.save(payment);
            
            // Schedule remaining installments
            List<String> installmentIntentIds = stripeService.scheduleInstallmentPayments(
                    paymentPlan, paymentPlan.getStripeCustomerId(), paymentMethodId);
            
            // Persist installment PaymentIntent IDs onto the Payment records so webhooks
            // for installments 2+ can locate them. installmentIntentIds contains only
            // the intents for installments 2..N (the upfront intent is already persisted
            // above), so entry i-1 maps to the Payment row at index i.
            List<Payment> installmentPayments = paymentRepository.findByRegistration_IdOrderByInstallmentNumberAsc(
                    registration.getId());
            String stripeCustomerId = paymentPlan.getStripeCustomerId();
            for (int i = 0; i < installmentPayments.size(); i++) {
                Payment p = installmentPayments.get(i);
                if (i > 0 && (i - 1) < installmentIntentIds.size()) {
                    p.setStripePaymentIntentId(installmentIntentIds.get(i - 1));
                }
                p.setStripeCustomerId(stripeCustomerId);
                paymentRepository.save(p);
            }
            
            // Update payment plan status
            paymentPlan.setStatus("ACTIVE");
            paymentPlanRepository.save(paymentPlan);
            
            // Update registration
            registration.setPaymentStatus("PARTIAL");
            registration.setStripePaymentIntentId(paymentIntent.getId());
            eventRegistrationRepository.save(registration);
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentStatus", "COMPLETED");
            response.put("paymentIntentId", paymentIntent.getId());
            response.put("installmentIntentIds", installmentIntentIds);
            response.put("remainingInstallments", paymentPlan.getTotalInstallments() - 1);
            response.put("nextPaymentDate", paymentPlan.getNextPaymentDate());
            response.put("totalAmount", paymentPlan.getTotalAmount());
            response.put("paidAmount", upfrontPayment.get().getAmount());
            response.put("remainingAmount", paymentPlan.getRemainingAmount());
            response.put("qrActivated", false);
            
            return response;
        } else {
            // Payment failed
            payment.setStatus("FAILED");
            payment.setFailedAt(LocalDateTime.now());
            payment.setFailureReason(paymentIntent.getLastPaymentError() != null ? 
                    paymentIntent.getLastPaymentError().getMessage() : "Payment confirmation failed");
            paymentRepository.save(payment);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("paymentStatus", "FAILED");
            response.put("error", paymentIntent.getLastPaymentError() != null ? 
                    paymentIntent.getLastPaymentError().getMessage() : "Payment confirmation failed");
            
            return response;
        }
    }

    // Get payment plan by registration ID
    public Optional<PaymentPlan> getPaymentPlanByRegistrationId(Long registrationId) {
        return paymentPlanRepository.findByRegistration_Id(registrationId);
    }

    // Get all payments for a registration
    public List<Payment> getPaymentsByRegistrationId(Long registrationId) {
        return paymentRepository.findByRegistration_IdOrderByInstallmentNumberAsc(registrationId);
    }

    // Get payment plan status
    public Map<String, Object> getPaymentPlanStatus(Long registrationId) {
        Optional<PaymentPlan> paymentPlanOptional = paymentPlanRepository.findByRegistration_Id(registrationId);
        
        if (paymentPlanOptional.isEmpty()) {
            return null;
        }
        
        PaymentPlan paymentPlan = paymentPlanOptional.get();
        List<Payment> payments = paymentRepository.findByRegistration_IdOrderByInstallmentNumberAsc(
                registrationId);
        
        long completedCount = payments.stream().filter(Payment::isCompleted).count();
        long totalCount = paymentPlan.getTotalInstallments();
        
        BigDecimal totalPaid = payments.stream()
                .filter(Payment::isCompleted)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalAmount = paymentPlan.getTotalAmount();
        BigDecimal remainingAmount = totalAmount.subtract(totalPaid);
        
        Map<String, Object> status = new HashMap<>();
        status.put("paymentPlanId", paymentPlan.getId());
        status.put("registrationId", registrationId);
        status.put("totalAmount", totalAmount);
        status.put("currency", paymentPlan.getCurrency());
        status.put("totalInstallments", totalCount);
        status.put("completedInstallments", completedCount);
        status.put("remainingInstallments", totalCount - completedCount);
        status.put("totalPaid", totalPaid);
        status.put("remainingAmount", remainingAmount);
        status.put("paymentStatus", paymentPlan.getStatus());
        status.put("qrActivated", paymentPlan.isQRCodeActivated());
        status.put("nextPaymentDate", paymentPlan.getNextPaymentDate());
        status.put("upfrontPercentage", paymentPlan.getUpfrontPercentage());
        status.put("upfrontAmount", paymentPlan.getUpfrontAmount());
        
        // Add payment details
        List<Map<String, Object>> paymentDetails = new ArrayList<>();
        for (Payment p : payments) {
            Map<String, Object> paymentInfo = new HashMap<>();
            paymentInfo.put("installmentNumber", p.getInstallmentNumber());
            paymentInfo.put("amount", p.getAmount());
            paymentInfo.put("currency", p.getCurrency());
            paymentInfo.put("status", p.getStatus());
            paymentInfo.put("dueDate", p.getDueDate());
            paymentInfo.put("paidAt", p.getPaidAt());
            paymentInfo.put("stripePaymentIntentId", p.getStripePaymentIntentId());
            paymentDetails.add(paymentInfo);
        }
        status.put("payments", paymentDetails);
        
        return status;
    }

    // Mark payment plan as completed (called when last installment is paid)
    @Transactional
    public void markPaymentPlanAsCompleted(Long paymentPlanId) {
        Optional<PaymentPlan> paymentPlanOptional = paymentPlanRepository.findById(paymentPlanId);
        
        if (paymentPlanOptional.isEmpty()) {
            return;
        }
        
        PaymentPlan paymentPlan = paymentPlanOptional.get();
        EventRegistration registration = paymentPlan.getRegistration();
        
        // Update payment plan
        paymentPlan.setStatus("COMPLETED");
        paymentPlan.setCompletedAt(LocalDateTime.now());
        paymentPlanRepository.save(paymentPlan);
        
        // Update registration
        registration.setPaymentStatus("COMPLETED");
        registration.setStatus("CONFIRMED");
        registration.setQrActivated(true);
        registration.setQrActivationDate(LocalDateTime.now());
        eventRegistrationRepository.save(registration);
    }

    // Check if QR code should be activated for a registration
    public boolean isQRCodeActivated(Long registrationId) {
        Optional<PaymentPlan> paymentPlanOptional = paymentPlanRepository.findByRegistration_Id(registrationId);
        
        if (paymentPlanOptional.isEmpty()) {
            // No payment plan, check registration payment status directly
            return eventRegistrationRepository.findById(registrationId)
                    .map(EventRegistration::isPaymentCompleted)
                    .orElse(false);
        }
        
        PaymentPlan paymentPlan = paymentPlanOptional.get();
        return paymentPlan.isQRCodeActivated();
    }

    // Get installment schedule
    public List<Map<String, Object>> getInstallmentSchedule(Long registrationId) {
        List<Payment> payments = paymentRepository.findByRegistration_IdOrderByInstallmentNumberAsc(registrationId);
        
        List<Map<String, Object>> schedule = new ArrayList<>();
        
        for (Payment payment : payments) {
            Map<String, Object> installment = new HashMap<>();
            installment.put("installmentNumber", payment.getInstallmentNumber());
            installment.put("amount", payment.getAmount());
            installment.put("currency", payment.getCurrency());
            installment.put("status", payment.getStatus());
            installment.put("dueDate", payment.getDueDate());
            installment.put("paidAt", payment.getPaidAt());
            installment.put("isCompleted", payment.isCompleted());
            installment.put("isOverdue", payment.getDueDate() != null && 
                    payment.getDueDate().isBefore(LocalDateTime.now()) && 
                    !payment.isCompleted());
            
            schedule.add(installment);
        }
        
        return schedule;
    }

    // Cancel payment plan
    @Transactional
    public void cancelPaymentPlan(Long paymentPlanId, String reason) {
        Optional<PaymentPlan> paymentPlanOptional = paymentPlanRepository.findById(paymentPlanId);
        
        if (paymentPlanOptional.isEmpty()) {
            throw new IllegalArgumentException("Payment plan not found");
        }
        
        PaymentPlan paymentPlan = paymentPlanOptional.get();
        EventRegistration registration = paymentPlan.getRegistration();
        
        // Cancel payment plan
        paymentPlan.setStatus("CANCELLED");
        paymentPlan.setCancelledAt(LocalDateTime.now());
        paymentPlan.setCancelledReason(reason);
        paymentPlanRepository.save(paymentPlan);
        
        // Update registration
        registration.setPaymentStatus("CANCELLED");
        registration.setStatus("CANCELLED");
        registration.setQrActivated(false);
        eventRegistrationRepository.save(registration);
        
        // Cancel all pending payments
        List<Payment> payments = paymentRepository.findByRegistration_IdAndStatusOrderByInstallmentNumberAsc(
                registration.getId(), "PENDING");
        
        for (Payment payment : payments) {
            payment.setStatus("CANCELLED");
            payment.setFailedAt(LocalDateTime.now());
            payment.setFailureReason("Payment plan cancelled: " + reason);
            paymentRepository.save(payment);
        }
    }

    // Retry failed payment
    @Transactional
    public Map<String, Object> retryFailedPayment(Long paymentId, String paymentMethodId) throws StripeException {
        Optional<Payment> paymentOptional = paymentRepository.findById(paymentId);
        
        if (paymentOptional.isEmpty()) {
            throw new IllegalArgumentException("Payment not found");
        }
        
        Payment payment = paymentOptional.get();
        PaymentPlan paymentPlan = paymentPlanRepository.findByRegistration_Id(
                payment.getRegistration().getId())
                .orElseThrow(() -> new IllegalArgumentException("Payment plan not found"));
        
        // Create new payment intent for retry
        long amountCents = stripeService.formatAmountForStripe(payment.getAmount());
        
        Map<String, String> metadata = new HashMap<>();
        metadata.put("registration_id", String.valueOf(payment.getRegistration().getId()));
        metadata.put("payment_plan_id", String.valueOf(paymentPlan.getId()));
        metadata.put("installment_number", String.valueOf(payment.getInstallmentNumber()));
        metadata.put("total_installments", String.valueOf(payment.getTotalInstallments()));
        metadata.put("retry_attempt", "true");
        
        PaymentIntent paymentIntent;
        try {
            paymentIntent = stripeService.createPaymentIntentWithoutConfirmation(
                    paymentPlan.getStripeCustomerId(),
                    amountCents,
                    payment.getCurrency().toLowerCase(),
                    "Retry payment for installment " + payment.getInstallmentNumber() + 
                            " of " + payment.getTotalInstallments(),
                    metadata
            );
        } catch (StripeException e) {
            payment.setStatus("FAILED");
            payment.setFailedAt(LocalDateTime.now());
            payment.setFailureReason("Retry failed: " + e.getMessage());
            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Payment retry failed: " + e.getMessage());
            response.put("paymentId", payment.getId());
            return response;
        }
        
        // Update payment record
        payment.setStripePaymentIntentId(paymentIntent.getId());
        payment.setStatus("PENDING");
        payment.setFailureReason(null);
        payment.setFailedAt(null);
        paymentRepository.save(payment);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("paymentIntentId", paymentIntent.getId());
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("paymentId", payment.getId());
        response.put("amount", payment.getAmount());
        response.put("currency", payment.getCurrency());
        
        return response;
    }

    // Get payment methods for a customer
    public List<Map<String, Object>> getCustomerPaymentMethods(Long registrationId) throws StripeException {
        Optional<PaymentPlan> paymentPlanOptional = paymentPlanRepository.findByRegistration_Id(registrationId);
        
        if (paymentPlanOptional.isEmpty() || paymentPlanOptional.get().getStripeCustomerId() == null) {
            return Collections.emptyList();
        }
        
        PaymentPlan paymentPlan = paymentPlanOptional.get();
        List<PaymentMethod> paymentMethods = stripeService.listCustomerPaymentMethods(
                paymentPlan.getStripeCustomerId());
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (PaymentMethod pm : paymentMethods) {
            Map<String, Object> method = new HashMap<>();
            method.put("id", pm.getId());
            method.put("type", pm.getType());
            method.put("cardBrand", pm.getCard() != null ? pm.getCard().getBrand() : null);
            method.put("cardLast4", pm.getCard() != null ? pm.getCard().getLast4() : null);
            method.put("cardExpMonth", pm.getCard() != null ? pm.getCard().getExpMonth() : null);
            method.put("cardExpYear", pm.getCard() != null ? pm.getCard().getExpYear() : null);
            result.add(method);
        }
        
        return result;
    }

    // Check if registration has an active payment plan
    public boolean hasActivePaymentPlan(Long registrationId) {
        Optional<PaymentPlan> paymentPlanOptional = paymentPlanRepository.findByRegistration_Id(registrationId);
        return paymentPlanOptional.map(PaymentPlan::isActive).orElse(false);
    }

    // Check if registration payment is completed
    public boolean isPaymentCompleted(Long registrationId) {
        Optional<PaymentPlan> paymentPlanOptional = paymentPlanRepository.findByRegistration_Id(registrationId);
        
        if (paymentPlanOptional.isEmpty()) {
            return eventRegistrationRepository.findById(registrationId)
                    .map(EventRegistration::isPaymentCompleted)
                    .orElse(false);
        }
        
        return paymentPlanOptional.get().isCompleted();
    }

    /**
     * Object-level authorization (#16252): resolves a registration and asserts the
     * authenticated caller either owns it (registration.user) or is an ORGANIZER
     * (incl. platform admin / legacy event owner) of its event.
     */
    @Transactional(readOnly = true)
    public void requirePaymentAccessByRegistration(Long registrationId, String email) {
        EventRegistration registration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));
        requirePaymentAccess(registration, email);
    }

    /** Resolves the plan's registration and runs the shared ownership check. */
    @Transactional(readOnly = true)
    public void requirePaymentAccessByPlan(Long paymentPlanId, String email) {
        PaymentPlan plan = paymentPlanRepository.findById(paymentPlanId)
                .orElseThrow(() -> new IllegalArgumentException("Payment plan not found"));
        requirePaymentAccess(plan.getRegistration(), email);
    }

    /** Resolves the payment's registration and runs the shared ownership check. */
    @Transactional(readOnly = true)
    public void requirePaymentAccessByPayment(Long paymentId, String email) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
        requirePaymentAccess(payment.getRegistration(), email);
    }

    private void requirePaymentAccess(EventRegistration registration, String email) {
        if (isOwnerOrOrganizer(registration, email)) {
            return;
        }
        throw new AccessDeniedException("You are not authorized to access this payment data");
    }

    private boolean isOwnerOrOrganizer(EventRegistration registration, String email) {
        if (registration.getUser() != null && registration.getUser().getEmail() != null
                && registration.getUser().getEmail().equalsIgnoreCase(email)) {
            return true;
        }
        Event event = registration.getEvent();
        return event != null && event.getId() != null
                && eventRoleService.hasRole(event.getId(), email, EventRole.ORGANIZER);
    }
}
