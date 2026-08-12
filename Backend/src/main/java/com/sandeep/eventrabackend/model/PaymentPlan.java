package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_plans")
public class PaymentPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registration_id", nullable = false)
    private EventRegistration registration;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 50)
    private String currency = "USD";

    @Column(nullable = false)
    private Integer totalInstallments = 4; // Default to 4 installments (25% upfront + 3 monthly)

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal installmentAmount;

    @Column(nullable = false, length = 50)
    private String paymentProvider = "STRIPE";

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, COMPLETED, CANCELLED, FAILED

    @Column(name = "upfront_percentage")
    private Integer upfrontPercentage = 25;

    @Column(name = "stripe_customer_id", length = 255)
    private String stripeCustomerId;

    @Column(name = "stripe_setup_intent_id", length = 255)
    private String stripeSetupIntentId;

    @Column(name = "stripe_payment_method_id", length = 255)
    private String stripePaymentMethodId;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "next_payment_date")
    private LocalDateTime nextPaymentDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancelled_reason", length = 500)
    private String cancelledReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EventRegistration getRegistration() {
        return registration;
    }

    public void setRegistration(EventRegistration registration) {
        this.registration = registration;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Integer getTotalInstallments() {
        return totalInstallments;
    }

    public void setTotalInstallments(Integer totalInstallments) {
        this.totalInstallments = totalInstallments;
    }

    public BigDecimal getInstallmentAmount() {
        return installmentAmount;
    }

    public void setInstallmentAmount(BigDecimal installmentAmount) {
        this.installmentAmount = installmentAmount;
    }

    public String getPaymentProvider() {
        return paymentProvider;
    }

    public void setPaymentProvider(String paymentProvider) {
        this.paymentProvider = paymentProvider;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getUpfrontPercentage() {
        return upfrontPercentage;
    }

    public void setUpfrontPercentage(Integer upfrontPercentage) {
        this.upfrontPercentage = upfrontPercentage;
    }

    public String getStripeCustomerId() {
        return stripeCustomerId;
    }

    public void setStripeCustomerId(String stripeCustomerId) {
        this.stripeCustomerId = stripeCustomerId;
    }

    public String getStripeSetupIntentId() {
        return stripeSetupIntentId;
    }

    public void setStripeSetupIntentId(String stripeSetupIntentId) {
        this.stripeSetupIntentId = stripeSetupIntentId;
    }

    public String getStripePaymentMethodId() {
        return stripePaymentMethodId;
    }

    public void setStripePaymentMethodId(String stripePaymentMethodId) {
        this.stripePaymentMethodId = stripePaymentMethodId;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getNextPaymentDate() {
        return nextPaymentDate;
    }

    public void setNextPaymentDate(LocalDateTime nextPaymentDate) {
        this.nextPaymentDate = nextPaymentDate;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(LocalDateTime cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public String getCancelledReason() {
        return cancelledReason;
    }

    public void setCancelledReason(String cancelledReason) {
        this.cancelledReason = cancelledReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods

    public BigDecimal getUpfrontAmount() {
        if (totalAmount == null || upfrontPercentage == null) {
            return BigDecimal.ZERO;
        }
        return totalAmount.multiply(new BigDecimal(upfrontPercentage))
                .divide(new BigDecimal(100), 2, java.math.RoundingMode.HALF_UP);
    }

    public BigDecimal getRemainingAmount() {
        if (totalAmount == null || upfrontPercentage == null) {
            return BigDecimal.ZERO;
        }
        return totalAmount.subtract(getUpfrontAmount());
    }

    public boolean isActive() {
        return "ACTIVE".equalsIgnoreCase(status);
    }

    public boolean isCompleted() {
        return "COMPLETED".equalsIgnoreCase(status);
    }

    public boolean isCancelled() {
        return "CANCELLED".equalsIgnoreCase(status);
    }

    public boolean isFailed() {
        return "FAILED".equalsIgnoreCase(status);
    }

    public boolean isQRCodeActivated() {
        // QR code activates only when all installments are paid
        return "COMPLETED".equalsIgnoreCase(status);
    }
}
