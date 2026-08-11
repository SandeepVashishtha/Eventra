package com.sandeep.eventrabackend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Audit log entry for a ticket scan / check-in at an event.
 * <p>
 * Every check-in attempt — successful and duplicate alike — is recorded here so
 * organizers can review scan history and spot abuse attempts. The current
 * {@link EventRegistration#getStatus()} drives live validation/stats, while this
 * log preserves the full audit trail.
 */
@Entity
@Table(name = "event_check_ins",
        indexes = {
                @Index(name = "idx_event_checkins_event_id", columnList = "event_id"),
                @Index(name = "idx_event_checkins_registration_id", columnList = "registration_id")
        })
public class EventCheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "registration_id", nullable = false)
    private Long registrationId;

    @Column(name = "user_id")
    private Long userId;

    /**
     * Display name of the attendee at the time of the scan (first + last name).
     */
    @Column(name = "user_name", length = 120)
    private String userName;

    /**
     * Snapshot of the event title at scan time. Falls back to a generated
     * "Event #id" label when null.
     */
    @Column(name = "event_name", length = 255)
    private String eventName;

    /**
     * Outcome of the scan: {@code CHECKED_IN} for a successful check-in,
     * {@code DUPLICATE_ATTEMPT} for a repeat scan of an already-checked-in ticket.
     */
    @Column(nullable = false, length = 30)
    private String status = "CHECKED_IN";

    @CreationTimestamp
    @Column(name = "checked_in_at", nullable = false, updatable = false)
    private LocalDateTime checkedInAt;

    /**
     * Email of the organizer who scanned the ticket.
     */
    @Column(name = "checked_in_by", length = 100)
    private String checkedInBy;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(Long registrationId) {
        this.registrationId = registrationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCheckedInAt() {
        return checkedInAt;
    }

    public void setCheckedInAt(LocalDateTime checkedInAt) {
        this.checkedInAt = checkedInAt;
    }

    public String getCheckedInBy() {
        return checkedInBy;
    }

    public void setCheckedInBy(String checkedInBy) {
        this.checkedInBy = checkedInBy;
    }
}
