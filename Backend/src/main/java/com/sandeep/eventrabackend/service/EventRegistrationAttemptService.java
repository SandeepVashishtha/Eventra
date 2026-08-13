package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.response.RegistrationResponse;
import com.sandeep.eventrabackend.exception.EventFullException;
import com.sandeep.eventrabackend.exception.EventNotFoundException;
import com.sandeep.eventrabackend.exception.RegistrationClosedException;
import com.sandeep.eventrabackend.exception.RegistrationConflictException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Runs a single registration attempt in a fresh transaction so optimistic-lock
 * retries in {@link EventService} are not stuck on a dirty persistence context.
 */
@Service
public class EventRegistrationAttemptService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final UserRepository userRepository;

    public EventRegistrationAttemptService(
            EventRepository eventRepository,
            EventRegistrationRepository eventRegistrationRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public RegistrationResponse execute(
            Long eventId,
            String userEmail,
            String seatId,
            boolean showProfileInAttendeeDirectory) {

        Event event = eventRepository.findByIdWithLock(eventId)
                .orElseThrow(() ->
                        new EventNotFoundException(
                                "Event not found with id: " + eventId));

        if (!event.isPublic()) {
            throw new EventNotFoundException("Event not found with id: " + eventId);
        }

        // A cancelled event must never accept new registrations (#12080).
        if ("CANCELLED".equals(event.getStatus())) {
            throw new RegistrationConflictException("This event has been cancelled.");
        }

        // Registration is only valid for events that have not already ended.
        // Without this guard the API accepted registrations for past events,
        // inflating registeredCount and creating stale registration rows (#11781).
        if (event.isEventPast()) {
            throw new RegistrationClosedException("Registration is closed for this event.");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + userEmail));

        if (eventRegistrationRepository.existsByEvent_IdAndUser_Email(eventId, userEmail)) {
            throw new RegistrationConflictException(
                    "You are already registered for this event.");
        }

        if (seatId != null && !seatId.isBlank()) {
            if (!seatId.matches("^[^:\\s]+:\\d+$")) {
                throw new IllegalArgumentException(
                        "Invalid seatId format. Expected elementId:seatIndex");
            }
            if (eventRegistrationRepository.existsByEvent_IdAndSeatId(eventId, seatId)) {
                throw new RegistrationConflictException("Seat " + seatId + " is already taken.");
            }
        }

        // Capacity guard. The event row is held under a pessimistic write
        // lock (findByIdWithLock) for the whole REQUIRES_NEW transaction, so this
        // in-memory check is safe against concurrent registrations and
        // keeps the increment atomic with the registration save below (#16175).
        if (event.getCapacity() != null
                && event.getRegisteredCount() >= event.getCapacity()) {
            throw new EventFullException(
                    "Event is already full. Capacity: " + event.getCapacity());
        }

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(user);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setStatus("CONFIRMED");
        registration.setSeatId(seatId);
        registration.setShowProfileInAttendeeDirectory(showProfileInAttendeeDirectory);

        try {
            registration = eventRegistrationRepository.saveAndFlush(registration);
        } catch (DataIntegrityViolationException ex) {
            throw mapRegistrationIntegrityViolation(ex, seatId);
        }

        event.setRegisteredCount(event.getRegisteredCount() + 1);
        Event saved = eventRepository.save(event);

        Integer spotsRemaining =
                (saved.getCapacity() == null)
                        ? null
                        : Math.max(0, saved.getCapacity() - saved.getRegisteredCount());

        return RegistrationResponse.builder()
                .eventId(saved.getId())
                .eventTitle(saved.getTitle())
                .userEmail(userEmail)
                .registeredAt(registration.getRegisteredAt())
                .spotsRemaining(spotsRemaining)
                .registrationStatus(registration.getStatus())
                .seatId(registration.getSeatId())
                .build();
    }

    private RegistrationConflictException mapRegistrationIntegrityViolation(
            DataIntegrityViolationException ex, String seatId) {
        String details = String.valueOf(ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage()).toLowerCase();

        if (details.contains("uk_event_registration_event_user")
                || (details.contains("event_id") && details.contains("user_id"))) {
            return new RegistrationConflictException(
                    "You are already registered for this event.");
        }

        if (details.contains("uk_event_registration_event_seat")
                || (seatId != null && !seatId.isBlank() && details.contains("seat"))) {
            return new RegistrationConflictException(
                    "Seat " + seatId + " is already taken.");
        }

        return new RegistrationConflictException(
                "Registration could not be completed due to a conflict. Please try again.");
    }
}
