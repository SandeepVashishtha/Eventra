package com.sandeep.eventrabackend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Ticket check-in record created when an organizer scans/validates a ticket
 * at the venue entrance. One row per (event, registration) — the unique
 * constraint makes duplicate check-ins idempotent (FIX #15369).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ticket_checkins",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_ticket_checkin_event_registration",
                        columnNames = {"event_id", "registration_id"}
                )
        })
public class TicketCheckIn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "registration_id", nullable = false)
    private Long registrationId;

    @Column(name = "attendee_name", length = 120)
    private String attendeeName;

    @Column(name = "checked_in_by", length = 100)
    private String checkedInBy;

    @CreationTimestamp
    @Column(name = "checked_in_at", nullable = false, updatable = false)
    private LocalDateTime checkedInAt;
}
