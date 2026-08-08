package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.response.CheckInHistoryItem;
import com.sandeep.eventrabackend.dto.response.CheckInResponse;
import com.sandeep.eventrabackend.dto.response.TicketStatsResponse;
import com.sandeep.eventrabackend.dto.response.TicketValidationResponse;
import com.sandeep.eventrabackend.exception.RegistrationConflictException;
import com.sandeep.eventrabackend.exception.TicketNotFoundException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventCheckIn;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventCheckInRepository;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ticket scanning and check-in logic for organizers.
 * <p>
 * {@code ticketId} accepted by this service is either the canonical numeric
 * registration id or a signed JWT QR token (issued at registration time).
 * Signatures are verified with the application's JWT signing key, so tampered,
 * expired, or cross-event tokens are rejected server-side — no client-side
 * trust is involved.
 */
@Service
public class TicketService {

    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_CHECKED_IN = "CHECKED_IN";
    private static final String STATUS_DUPLICATE = "DUPLICATE_ATTEMPT";

    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventCheckInRepository eventCheckInRepository;
    private final EventRepository eventRepository;
    private final EventRoleService eventRoleService;
    private final JwtTokenProvider jwtTokenProvider;

    public TicketService(
            EventRegistrationRepository eventRegistrationRepository,
            EventCheckInRepository eventCheckInRepository,
            EventRepository eventRepository,
            EventRoleService eventRoleService,
            JwtTokenProvider jwtTokenProvider) {
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.eventCheckInRepository = eventCheckInRepository;
        this.eventRepository = eventRepository;
        this.eventRoleService = eventRoleService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public TicketValidationResponse validateTicket(String ticketId, Long eventId, String organizerEmail) {
        eventRoleService.requireRole(eventId, organizerEmail, EventRole.ORGANIZER);

        EventRegistration registration = resolveRegistration(ticketId, eventId);

        if (STATUS_CANCELLED.equals(registration.getStatus())) {
            throw new IllegalArgumentException("This registration has been cancelled.");
        }

        if (STATUS_CHECKED_IN.equals(registration.getStatus())) {
            recordScan(registration, STATUS_DUPLICATE, organizerEmail);
            return TicketValidationResponse.builder()
                    .valid(true)
                    .alreadyCheckedIn(true)
                    .registrationId(registration.getId())
                    .userName(fullName(registration.getUser()))
                    .email(registration.getUser().getEmail())
                    .eventId(eventId)
                    .attendanceStatus(registration.getStatus())
                    .message("This ticket has already been checked in!")
                    .build();
        }

        return TicketValidationResponse.builder()
                .valid(true)
                .alreadyCheckedIn(false)
                .registrationId(registration.getId())
                .userName(fullName(registration.getUser()))
                .email(registration.getUser().getEmail())
                .eventId(eventId)
                .attendanceStatus(registration.getStatus())
                .message("Ticket verified successfully.")
                .build();
    }

    @Transactional
    public CheckInResponse checkIn(String ticketId, Long eventId, String organizerEmail) {
        eventRoleService.requireRole(eventId, organizerEmail, EventRole.ORGANIZER);

        EventRegistration registration = resolveRegistration(ticketId, eventId);

        if (STATUS_CANCELLED.equals(registration.getStatus())) {
            throw new IllegalArgumentException("Registration is cancelled");
        }

        if (STATUS_CHECKED_IN.equals(registration.getStatus())) {
            recordScan(registration, STATUS_DUPLICATE, organizerEmail);
            throw new RegistrationConflictException("Attendee is already checked in");
        }

        registration.setStatus(STATUS_CHECKED_IN);
        eventRegistrationRepository.save(registration);

        recordScan(registration, STATUS_CHECKED_IN, organizerEmail);

        return new CheckInResponse(
                true,
                "Attendee check-in recorded successfully",
                registration.getId(),
                eventId);
    }

    @Transactional(readOnly = true)
    public List<CheckInHistoryItem> getCheckInHistory(Long eventId, String organizerEmail) {
        List<EventCheckIn> logs;
        if (eventId != null) {
            eventRoleService.requireRole(eventId, organizerEmail, EventRole.ORGANIZER);
            logs = eventCheckInRepository.findByEventIdOrderByCheckedInAtDesc(eventId);
        } else {
            // No event filter: only expose logs for events the organizer can manage.
            List<EventCheckIn> all = eventCheckInRepository.findAllByOrderByCheckedInAtDesc();
            Set<Long> authorizedEventIds = all.stream()
                    .map(EventCheckIn::getEventId)
                    .distinct()
                    .filter(id -> eventRoleService.hasRole(id, organizerEmail, EventRole.ORGANIZER))
                    .collect(Collectors.toSet());
            logs = all.stream()
                    .filter(log -> authorizedEventIds.contains(log.getEventId()))
                    .toList();
        }

        return logs.stream().map(this::toHistoryItem).toList();
    }

    @Transactional(readOnly = true)
    public TicketStatsResponse getTicketStats(Long eventId, String organizerEmail) {
        eventRoleService.requireRole(eventId, organizerEmail, EventRole.ORGANIZER);

        long totalRegistrations =
                eventRegistrationRepository.countByEvent_IdAndStatusNot(eventId, STATUS_CANCELLED);
        long checkedInAttendees =
                eventRegistrationRepository.countByEvent_IdAndStatus(eventId, STATUS_CHECKED_IN);
        long remainingAttendees = Math.max(0, totalRegistrations - checkedInAttendees);
        int attendancePercentage = totalRegistrations > 0
                ? (int) Math.round((double) checkedInAttendees / totalRegistrations * 100)
                : 0;

        return new TicketStatsResponse(
                totalRegistrations,
                checkedInAttendees,
                remainingAttendees,
                attendancePercentage);
    }

    /**
     * Resolves the scanned {@code ticketId} to a persisted registration.
     * Accepts either a signed JWT QR token or a raw numeric registration id.
     */
    private EventRegistration resolveRegistration(String ticketId, Long eventId) {
        Long registrationId;
        if (ticketId.startsWith("eyJ")) {
            Claims claims;
            try {
                claims = jwtTokenProvider.getClaimsFromToken(ticketId);
            } catch (JwtException | IllegalArgumentException ex) {
                throw new IllegalArgumentException(
                        "Security Alert: QR Code is invalid, expired, or has been tampered with!");
            }
            Object registrationIdClaim = claims.get("registrationId");
            Object tokenEventIdClaim = claims.get("eventId");
            if (registrationIdClaim == null || tokenEventIdClaim == null) {
                throw new IllegalArgumentException(
                        "Security Alert: QR Code is invalid, expired, or has been tampered with!");
            }
            long tokenEventId = ((Number) tokenEventIdClaim).longValue();
            if (tokenEventId != eventId.longValue()) {
                throw new IllegalArgumentException(
                        "Security Alert: Ticket is valid, but registered for a different event.");
            }
            registrationId = ((Number) registrationIdClaim).longValue();
        } else {
            try {
                registrationId = Long.valueOf(ticketId);
            } catch (NumberFormatException ex) {
                throw new TicketNotFoundException("Ticket registration not found. Please verify details.");
            }
        }

        EventRegistration registration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new TicketNotFoundException(
                        "Ticket registration not found. Please verify details."));

        if (!registration.getEvent().getId().equals(eventId)) {
            throw new IllegalArgumentException("Ticket is valid, but registered for a different event.");
        }

        return registration;
    }

    private void recordScan(EventRegistration registration, String status, String organizerEmail) {
        EventCheckIn log = new EventCheckIn();
        log.setEventId(registration.getEvent().getId());
        log.setRegistrationId(registration.getId());
        log.setUserId(registration.getUser().getId());
        log.setUserName(fullName(registration.getUser()));
        log.setEventName(eventTitle(registration.getEvent().getId()));
        log.setStatus(status);
        log.setCheckedInAt(LocalDateTime.now());
        log.setCheckedInBy(organizerEmail);
        eventCheckInRepository.save(log);
    }

    private String eventTitle(Long eventId) {
        return eventRepository.findById(eventId)
                .map(Event::getTitle)
                .orElse(null);
    }

    private CheckInHistoryItem toHistoryItem(EventCheckIn log) {
        return CheckInHistoryItem.builder()
                .id(log.getId())
                .ticketId(log.getRegistrationId())
                .name(log.getUserName())
                .event(log.getEventName() != null ? log.getEventName() : "Event #" + log.getEventId())
                .status(STATUS_CHECKED_IN.equals(log.getStatus()) ? "Verified" : "Flagged")
                .time(log.getCheckedInAt())
                .build();
    }

    private String fullName(User user) {
        return (user.getFirstName() + " " + user.getLastName()).trim();
    }
}
