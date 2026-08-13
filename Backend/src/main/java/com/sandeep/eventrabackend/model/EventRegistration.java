package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "event_registrations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_event_registration_event_user",
                        columnNames = {"event_id", "user_id"}
                ),
                @UniqueConstraint(
                        name = "uk_event_registration_event_seat",
                        columnNames = {"event_id", "seat_id"}
                )
        }
)
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    @Column(nullable = false, length = 30)
    private String status = "CONFIRMED";

    /**
     * Selected seat identifier (format {@code elementId:seatIndex}) when the
     * event offers seat selection. Null when no seat was chosen.
     */
    @Column(name = "seat_id", length = 100)
    private String seatId;

    @Column(name = "show_profile_in_attendee_directory", nullable = false)
    private boolean showProfileInAttendeeDirectory = false;

    /**
     * Group ID for group/bulk registrations (e.g., "Table of 10" tickets).
     * All registrations with the same groupId belong to the same group.
     */
    @Column(name = "group_id", length = 100)
    private String groupId;

    /**
     * Flag indicating if this registration is the primary buyer for a group.
     * Used to identify the main contact person for group tickets.
     */
    @Column(name = "is_group_primary", nullable = false)
    private boolean isGroupPrimary = false;

    /**
     * Name of the group (e.g., "Acme Corp - Table 5").
     * Used for display purposes when managing group check-ins.
     */
    @Column(name = "group_name", length = 200)
    private String groupName;

    @Column(name = "ticket_price", precision = 10, scale = 2)
    private java.math.BigDecimal ticketPrice;

    @Column(name = "payment_status", length = 30)
    private String paymentStatus = "PENDING"; // PENDING, PARTIAL, COMPLETED, FAILED, REFUNDED

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_provider", length = 50)
    private String paymentProvider;

    @Column(name = "stripe_payment_intent_id", length = 255)
    private String stripePaymentIntentId;

    @Column(name = "stripe_customer_id", length = 255)
    private String stripeCustomerId;

    @Column(name = "qr_activated", nullable = false)
    private boolean qrActivated = false;

    @Column(name = "qr_activation_date")
    private java.time.LocalDateTime qrActivationDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSeatId() {
        return seatId;
    }

    public void setSeatId(String seatId) {
        this.seatId = seatId;
    }

    public boolean isShowProfileInAttendeeDirectory() {
        return showProfileInAttendeeDirectory;
    }

    public void setShowProfileInAttendeeDirectory(boolean showProfileInAttendeeDirectory) {
        this.showProfileInAttendeeDirectory = showProfileInAttendeeDirectory;
    }

    public String getGroupId() {
        return groupId;
    }

    public void setGroupId(String groupId) {
        this.groupId = groupId;
    }

    public boolean isGroupPrimary() {
        return isGroupPrimary;
    }

    public void setGroupPrimary(boolean groupPrimary) {
        isGroupPrimary = groupPrimary;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public java.math.BigDecimal getTicketPrice() {
        return ticketPrice;
    }

    public void setTicketPrice(java.math.BigDecimal ticketPrice) {
        this.ticketPrice = ticketPrice;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentProvider() {
        return paymentProvider;
    }

    public void setPaymentProvider(String paymentProvider) {
        this.paymentProvider = paymentProvider;
    }

    public String getStripePaymentIntentId() {
        return stripePaymentIntentId;
    }

    public void setStripePaymentIntentId(String stripePaymentIntentId) {
        this.stripePaymentIntentId = stripePaymentIntentId;
    }

    public String getStripeCustomerId() {
        return stripeCustomerId;
    }

    public void setStripeCustomerId(String stripeCustomerId) {
        this.stripeCustomerId = stripeCustomerId;
    }

    public boolean isQrActivated() {
        return qrActivated;
    }

    public void setQrActivated(boolean qrActivated) {
        this.qrActivated = qrActivated;
    }

    public java.time.LocalDateTime getQrActivationDate() {
        return qrActivationDate;
    }

    public void setQrActivationDate(java.time.LocalDateTime qrActivationDate) {
        this.qrActivationDate = qrActivationDate;
    }

    public boolean isPaymentCompleted() {
        return "COMPLETED".equalsIgnoreCase(paymentStatus);
    }

    public boolean isPaymentPartial() {
        return "PARTIAL".equalsIgnoreCase(paymentStatus);
    }

    public boolean isPaymentPending() {
        return "PENDING".equalsIgnoreCase(paymentStatus);
    }
}
