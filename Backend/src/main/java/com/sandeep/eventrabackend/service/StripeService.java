package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.Payment;
import com.sandeep.eventrabackend.model.PaymentPlan;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.PaymentPlanRepository;
import com.sandeep.eventrabackend.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.net.Webhook;
import com.stripe.param.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class StripeService {

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Value("${stripe.webhook.secret:}")
    private String stripeWebhookSecret;

    private final PaymentRepository paymentRepository;
    private final PaymentPlanRepository paymentPlanRepository;
    private final EventRegistrationRepository eventRegistrationRepository;

    public StripeService(PaymentRepository paymentRepository,
                         PaymentPlanRepository paymentPlanRepository,
                         EventRegistrationRepository eventRegistrationRepository) {
        this.paymentRepository = paymentRepository;
        this.paymentPlanRepository = paymentPlanRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
    }

    @PostConstruct
    public void init() {
        if (stripeApiKey != null && !stripeApiKey.isEmpty()) {
            Stripe.apiKey = stripeApiKey;
        }
    }

    // Initialize Stripe with custom API key
    public void setApiKey(String apiKey) {
        Stripe.apiKey = apiKey;
    }

    // Create a Stripe Customer
    public Customer createCustomer(String email, String name, String phone, Map<String, String> metadata) throws StripeException {
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(email)
                .setName(name)
                .setPhone(phone)
                .setMetadata(metadata)
                .build();
        
        return Customer.create(params);
    }

    // Retrieve a Customer
    public Customer getCustomer(String customerId) throws StripeException {
        return Customer.retrieve(customerId);
    }

    // Create a Setup Intent for saving payment method
    public SetupIntent createSetupIntent(String customerId, String paymentMethodType) throws StripeException {
        SetupIntentCreateParams params = SetupIntentCreateParams.builder()
                .setCustomer(customerId)
                .addAllPaymentMethodType(Arrays.asList(paymentMethodType))
                .setUsage(SetupIntentCreateParams.Usage.OFF_SESSION)
                .putMetadata("payment_type", "installment")
                .build();
        
        return SetupIntent.create(params);
    }

    // Create a Payment Intent for the upfront payment
    public PaymentIntent createPaymentIntent(
            String customerId,
            long amount,
            String currency,
            String paymentMethodId,
            String description,
            Map<String, String> metadata) throws StripeException {
        
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setCustomer(customerId)
                .setAmount(amount)
                .setCurrency(currency)
                .setPaymentMethod(paymentMethodId)
                .setConfirm(true)
                .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.AUTOMATIC)
                .setDescription(description)
                .putAllMetadata(metadata)
                .build();
        
        return PaymentIntent.create(params);
    }

    // Create a Payment Intent without immediate confirmation
    public PaymentIntent createPaymentIntentWithoutConfirmation(
            String customerId,
            long amount,
            String currency,
            String description,
            Map<String, String> metadata) throws StripeException {
        
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setCustomer(customerId)
                .setAmount(amount)
                .setCurrency(currency)
                .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.AUTOMATIC)
                .setDescription(description)
                .putAllMetadata(metadata)
                .build();
        
        return PaymentIntent.create(params);
    }

    // Confirm a Payment Intent
    public PaymentIntent confirmPaymentIntent(String paymentIntentId, String paymentMethodId) throws StripeException {
        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
        
        PaymentIntentConfirmParams params = PaymentIntentConfirmParams.builder()
                .setPaymentMethod(paymentMethodId)
                .build();
        
        return intent.confirm(params);
    }

    // Create a Subscription for installment payments
    public Subscription createSubscription(
            String customerId,
            String priceId,
            String paymentMethodId,
            Long trialEnd,
            Map<String, String> metadata) throws StripeException {
        
        SubscriptionCreateParams params = SubscriptionCreateParams.builder()
                .setCustomer(customerId)
                .addItem(SubscriptionCreateParams.Item.builder()
                        .setPrice(priceId)
                        .build())
                .setDefaultPaymentMethod(paymentMethodId)
                .setTrialEnd(trialEnd)
                .setPaymentBehavior(SubscriptionCreateParams.PaymentBehavior.DEFAULT_INCOMPLETE)
                .addAllExpand(Arrays.asList("latest_invoice.payment_intent"))
                .setMetadata(metadata)
                .build();
        
        return Subscription.create(params);
    }

    // Schedule installment payments using Payment Intents with scheduled confirmation
    public List<String> scheduleInstallmentPayments(
            PaymentPlan paymentPlan,
            String customerId,
            String paymentMethodId) throws StripeException {
        
        List<String> paymentIntentIds = new ArrayList<>();
        
        // Calculate installment amounts
        BigDecimal installmentAmount = paymentPlan.getInstallmentAmount();
        BigDecimal remainingAmount = paymentPlan.getRemainingAmount();
        
        // Convert to cents (Stripe uses smallest currency unit)
        long installmentAmountCents = installmentAmount.multiply(new BigDecimal(100)).longValue();
        
        // Create remaining installments (2..N); the upfront payment is created
        // and confirmed separately by PaymentPlanService.
        LocalDateTime eventDate = paymentPlan.getRegistration().getEvent().getEventDate();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 2; i <= paymentPlan.getTotalInstallments(); i++) {
            // Calculate due date: spread payments evenly between now and event date
            long daysBetween = eventDate != null
                    ? ChronoUnit.DAYS.between(now.toLocalDate(), eventDate.toLocalDate())
                    : 0;
            long interval = Math.max(1, paymentPlan.getTotalInstallments() - 1);
            long daysUntilInstallment = (daysBetween / interval) * (i - 1);
            LocalDateTime dueDate = now.plusDays(daysUntilInstallment);
            
            PaymentIntent intent = createPaymentIntentWithoutConfirmation(
                    customerId,
                    installmentAmountCents,
                    paymentPlan.getCurrency().toLowerCase(),
                    "Installment " + i + " of " + paymentPlan.getTotalInstallments() + 
                            " for " + paymentPlan.getRegistration().getEvent().getTitle(),
                    createMetadata(paymentPlan, i, paymentPlan.getTotalInstallments())
            );
            
            paymentIntentIds.add(intent.getId());
        }
        
        return paymentIntentIds;
    }

    // Create metadata for payment intents
    private Map<String, String> createMetadata(PaymentPlan paymentPlan, int installmentNumber, int totalInstallments) {
        Map<String, String> metadata = new HashMap<>();
        metadata.put("registration_id", String.valueOf(paymentPlan.getRegistration().getId()));
        metadata.put("event_id", String.valueOf(paymentPlan.getRegistration().getEvent().getId()));
        metadata.put("user_id", String.valueOf(paymentPlan.getRegistration().getUser().getId()));
        metadata.put("installment_number", String.valueOf(installmentNumber));
        metadata.put("total_installments", String.valueOf(totalInstallments));
        metadata.put("payment_plan_id", String.valueOf(paymentPlan.getId()));
        metadata.put("payment_type", "installment");
        return metadata;
    }

    // Retrieve a Payment Intent
    public PaymentIntent getPaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }

    // Retrieve a Subscription
    public Subscription getSubscription(String subscriptionId) throws StripeException {
        return Subscription.retrieve(subscriptionId);
    }

    // Verify webhook signature and construct the event (single verification).
    // Fails closed: throws if the secret is missing or the signature is invalid
    // rather than silently returning a boolean that lets bad payloads through.
    // Returns the constructed event so the caller can use it without re-parsing.
    public Event verifyWebhookSignature(String payload, String signatureHeader) throws StripeException {
        if (stripeWebhookSecret == null || stripeWebhookSecret.isEmpty()) {
            throw new IllegalStateException(
                    "Stripe webhook secret is not configured; refusing to process webhook");
        }
        return Webhook.constructEvent(payload, signatureHeader, stripeWebhookSecret);
    }

    private final Set<String> processedEventIds = ConcurrentHashMap.newKeySet();

    // Idempotency: returns true if a Stripe event id has already been processed.
    public boolean isEventProcessed(String eventId) {
        return processedEventIds.contains(eventId);
    }

    // Idempotency: record a Stripe event id as processed so retries are ignored.
    public void markEventProcessed(String eventId) {
        processedEventIds.add(eventId);
    }

    // Handle payment intent succeeded event
    @Transactional
    public void handlePaymentIntentSucceeded(PaymentIntent paymentIntent) {
        String paymentIntentId = paymentIntent.getId();
        String registrationId = paymentIntent.getMetadata().get("registration_id");
        String installmentNumberStr = paymentIntent.getMetadata().get("installment_number");
        String totalInstallmentsStr = paymentIntent.getMetadata().get("total_installments");
        
        if (registrationId == null) {
            return;
        }
        
        try {
            Long regId = Long.parseLong(registrationId);
            Integer installmentNumber = installmentNumberStr != null ? Integer.parseInt(installmentNumberStr) : 1;
            Integer totalInstallments = totalInstallmentsStr != null ? Integer.parseInt(totalInstallmentsStr) : 1;
            
            // Find the payment in database
            Optional<Payment> paymentOptional = paymentRepository.findByStripePaymentIntentId(paymentIntentId);

            // Idempotency: skip if this payment intent was already completed
            if (paymentOptional.isPresent() && "COMPLETED".equals(paymentOptional.get().getStatus())) {
                return;
            }
            
            // Verify the payment record exists for this intent and that the amount
            // Stripe reports matches the expected amount before releasing anything.
            Payment expected = paymentOptional.orElseThrow(() ->
                    new IllegalStateException("No payment record found for payment intent: " + paymentIntentId));
            long paidCents = paymentIntent.getAmount();
            if (paidCents != formatAmountForStripe(expected.getAmount())) {
                throw new IllegalStateException("Paid amount mismatch for PI " + paymentIntentId);
            }

            Payment payment = expected;
            payment.setTransactionId(paymentIntent.getLatestChargeObject() != null ?
                    paymentIntent.getLatestChargeObject().getId() : null);
            payment.setPaymentMethod(paymentIntent.getPaymentMethod());
            payment.setPaymentProvider("STRIPE");
            payment.setCurrency(paymentIntent.getCurrency().toUpperCase());

            // Update payment status
            payment.setStatus("COMPLETED");
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Only release the ticket (activate QR) on the final installment AND when
            // every installment in the plan has actually been completed.
            if (installmentNumber.equals(totalInstallments)) {
                List<Payment> planPayments =
                        paymentRepository.findByRegistration_IdOrderByInstallmentNumberAsc(regId);
                boolean allInstallmentsCompleted = planPayments.stream()
                        .allMatch(p -> "COMPLETED".equals(p.getStatus()));
                if (allInstallmentsCompleted) {
                    // Mark payment plan as completed
                    Optional<PaymentPlan> paymentPlanOptional = paymentPlanRepository.findByRegistration_Id(regId);
                    if (paymentPlanOptional.isPresent()) {
                        PaymentPlan paymentPlan = paymentPlanOptional.get();
                        paymentPlan.setStatus("COMPLETED");
                        paymentPlan.setCompletedAt(LocalDateTime.now());
                        paymentPlanRepository.save(paymentPlan);

                        // Update registration payment status and persist it within the same transaction
                        EventRegistration registration = paymentPlan.getRegistration();
                        registration.setPaymentStatus("COMPLETED");
                        registration.setQrActivated(true);
                        registration.setQrActivationDate(LocalDateTime.now());
                        eventRegistrationRepository.save(registration);
                    }
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error handling payment intent succeeded: " + e.getMessage());
        }
    }

    // Handle payment intent failed event
    @Transactional
    public void handlePaymentIntentFailed(PaymentIntent paymentIntent) {
        String paymentIntentId = paymentIntent.getId();
        String registrationId = paymentIntent.getMetadata().get("registration_id");
        
        if (registrationId == null) {
            return;
        }
        
        try {
            Long regId = Long.parseLong(registrationId);
            
            Optional<Payment> paymentOptional = paymentRepository.findByStripePaymentIntentId(paymentIntentId);

            // Idempotency: skip if this payment intent was already marked failed
            if (paymentOptional.isPresent() && "FAILED".equals(paymentOptional.get().getStatus())) {
                return;
            }
            
            Payment payment;
            if (paymentOptional.isPresent()) {
                payment = paymentOptional.get();
            } else {
                // Create a failed payment record linked to the MANAGED registration
                payment = new Payment();
                payment.setStripePaymentIntentId(paymentIntentId);
                payment.setPaymentProvider("STRIPE");
                EventRegistration registration = eventRegistrationRepository.findById(regId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "EventRegistration not found for id: " + regId));
                payment.setRegistration(registration);
            }
            
            payment.setStatus("FAILED");
            payment.setFailedAt(LocalDateTime.now());
            payment.setFailureReason(paymentIntent.getLastPaymentError() != null ? 
                    paymentIntent.getLastPaymentError().getMessage() : "Payment failed");
            paymentRepository.save(payment);
            
        } catch (Exception e) {
            System.err.println("Error handling payment intent failed: " + e.getMessage());
        }
    }

    // Calculate installment schedule
    public List<LocalDateTime> calculateInstallmentSchedule(LocalDateTime startDate, LocalDateTime eventDate, int totalInstallments) {
        List<LocalDateTime> schedule = new ArrayList<>();
        
        long totalDays = ChronoUnit.DAYS.between(startDate.toLocalDate(), eventDate.toLocalDate());
        long intervalDays = totalDays / Math.max(1, totalInstallments - 1);
        
        for (int i = 0; i < totalInstallments; i++) {
            LocalDateTime dueDate = startDate.plusDays(i * intervalDays);
            // Ensure due date doesn't go beyond event date
            if (dueDate.isAfter(eventDate)) {
                dueDate = eventDate;
            }
            schedule.add(dueDate);
        }
        
        return schedule;
    }

    // Format amount for Stripe (convert to cents)
    public long formatAmountForStripe(BigDecimal amount) {
        return amount.multiply(new BigDecimal(100)).longValue();
    }

    // Format amount from Stripe (convert from cents)
    public BigDecimal formatAmountFromStripe(long amount) {
        return new BigDecimal(amount).divide(new BigDecimal(100), 2, java.math.RoundingMode.HALF_UP);
    }

    // Create a Product for installment plans
    public Product createInstallmentProduct(String name, String description) throws StripeException {
        ProductCreateParams params = ProductCreateParams.builder()
                .setName(name)
                .setDescription(description)
                .build();
        
        return Product.create(params);
    }

    // Create a Price for installment payments
    public Price createInstallmentPrice(
            String productId,
            long unitAmount,
            String currency,
            String interval,
            int intervalCount) throws StripeException {
        
        PriceCreateParams params = PriceCreateParams.builder()
                .setProduct(productId)
                .setUnitAmount(unitAmount)
                .setCurrency(currency)
                .setRecurring(PriceCreateParams.Recurring.builder()
                        .setInterval(PriceCreateParams.Recurring.Interval.valueOf(interval.toUpperCase()))
                        .setIntervalCount((long) intervalCount)
                        .build())
                .build();
        
        return Price.create(params);
    }

    // Get customer's default payment method
    public PaymentMethod getDefaultPaymentMethod(String customerId) throws StripeException {
        Customer customer = Customer.retrieve(customerId);
        String invoiceSettingsDefaultPaymentMethod = customer.getInvoiceSettings().getDefaultPaymentMethod();
        
        if (invoiceSettingsDefaultPaymentMethod != null) {
            return PaymentMethod.retrieve(invoiceSettingsDefaultPaymentMethod);
        }
        
        return null;
    }

    // List customer's payment methods
    public List<PaymentMethod> listCustomerPaymentMethods(String customerId) throws StripeException {
        PaymentMethodListParams params = PaymentMethodListParams.builder()
                .setCustomer(customerId)
                .setType(PaymentMethodListParams.Type.CARD)
                .build();
        
        PaymentMethodCollection paymentMethods = PaymentMethod.list(params);
        return paymentMethods.getData();
    }

    // Attach payment method to customer
    public PaymentMethod attachPaymentMethod(String paymentMethodId, String customerId) throws StripeException {
        PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
        
        PaymentMethodAttachParams params = PaymentMethodAttachParams.builder()
                .setCustomer(customerId)
                .build();
        
        return paymentMethod.attach(params);
    }

    // Detach payment method from customer
    public PaymentMethod detachPaymentMethod(String paymentMethodId) throws StripeException {
        PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
        return paymentMethod.detach();
    }

    // Create refund
    public Refund createRefund(String chargeId, long amount) throws StripeException {
        RefundCreateParams params = RefundCreateParams.builder()
                .setCharge(chargeId)
                .setAmount(amount)
                .build();
        
        return Refund.create(params);
    }

    /**
     * Refund a confirmed paid registration based on the event's refund policy.
     *
     * <p>Retrieves the PaymentIntent associated with the registration, reads the
     * captured charge and refunds either the full amount (FULL) or a percentage of
     * it (PARTIAL using {@code refundPercent}). When the policy is NONE the method
     * is a no-op and returns {@code null}.</p>
     *
     * @param stripePaymentIntentId the registration's Stripe Payment Intent id
     * @param refundPolicy           FULL, PARTIAL or NONE (case-insensitive)
     * @param refundPercent          percentage to refund when policy is PARTIAL (1-100)
     * @return the created {@link Refund}, or {@code null} when no refund is due
     * @throws StripeException if the Stripe API call fails
     */
    public Refund refundPayment(String stripePaymentIntentId, String refundPolicy, Integer refundPercent)
            throws StripeException {
        if (stripePaymentIntentId == null || refundPolicy == null) {
            return null;
        }
        if (!"FULL".equalsIgnoreCase(refundPolicy) && !"PARTIAL".equalsIgnoreCase(refundPolicy)) {
            return null;
        }

        PaymentIntent intent = PaymentIntent.retrieve(stripePaymentIntentId);
        Charge charge = intent.getLatestChargeObject();
        if (charge == null) {
            return null;
        }

        long chargeAmount = charge.getAmount();
        long refundAmount;
        if ("PARTIAL".equalsIgnoreCase(refundPolicy)) {
            if (refundPercent == null) {
                return null;
            }
            refundAmount = (long) (chargeAmount * refundPercent / 100.0);
        } else {
            refundAmount = chargeAmount;
        }

        return createRefund(charge.getId(), refundAmount);
    }
}
