package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.EventCreateRequest;
import com.sandeep.eventrabackend.dto.request.EventUpdateRequest;
import com.sandeep.eventrabackend.dto.response.EventAvailabilityResponse;
import com.sandeep.eventrabackend.dto.response.EventResponse;
import com.sandeep.eventrabackend.dto.response.MyRegisteredEventResponse;
import com.sandeep.eventrabackend.dto.response.RegistrationResponse;
import com.sandeep.eventrabackend.exception.EventFullException;
import com.sandeep.eventrabackend.exception.EventNotFoundException;
import com.sandeep.eventrabackend.exception.RegistrationConflictException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service handling event queries and registrations.
 *
 * <h3>Concurrency strategy (Issue #2104)</h3>
 * <ul>
 *   <li><b>Pessimistic write lock</b> ({@code SELECT … FOR UPDATE}) is acquired
 *       via {@link EventRepository#findByIdWithLock} at the start of every
 *       registration transaction. Only one thread can hold the lock at a time,
 *       so the capacity check and the attendee-set mutation are serialised.</li>
 *   <li><b>Optimistic version field</b> ({@code @Version} on {@link Event}) acts
 *       as a safety net: if two transactions somehow both pass the lock path and
 *       attempt to commit, JPA will reject the second with an
 *       {@link ObjectOptimisticLockingFailureException}, which the
 *       {@code GlobalExceptionHandler} converts to HTTP 409.</li>
 *   <li>A <b>retry loop</b> (max {@value #MAX_REGISTRATION_RETRIES} attempts)
 *       transparently re-tries on optimistic conflicts so transient contention
 *       does not surface as an error to the caller.</li>
 * </ul>
 */
@Service
public class EventService {

    private static final Logger log = LoggerFactory.getLogger(EventService.class);

    /** Maximum number of automatic retries on optimistic-lock conflict. */
    private static final int MAX_REGISTRATION_RETRIES = 3;

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final UserRepository userRepository;

    public EventService(
            EventRepository eventRepository,
            EventRegistrationRepository eventRegistrationRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Returns availability data for the given event.
     * The endpoint is public (no JWT required) so anyone can check spots.
     * The {@code eventPassed} flag in the response lets the frontend display
     * a "This event has already passed" notice instead of a registration button.
     *
     * @throws EventNotFoundException if no event with {@code id} exists
     */
    public EventAvailabilityResponse getEventAvailability(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EventNotFoundException("Event not found with id: " + id));

        Integer capacity = event.getCapacity();
        int registeredCount = event.getRegisteredCount();

        Integer spotsLeft =
                (capacity == null)
                        ? null
                        : Math.max(0, capacity - registeredCount);

        boolean isFull =
                (capacity != null) && (registeredCount >= capacity);

        return EventAvailabilityResponse.builder()
                .capacity(capacity)
                .registeredCount(registeredCount)
                .spotsLeft(spotsLeft)
                .isFull(isFull)
                .eventPassed(event.isEventPast())
                .build();
    }

    // ── Issue #2102 — Event Fetch ─────────────────────────────────────

    /**
     * Retrieves an event by ID.
     *
     * @throws EventNotFoundException if the event does not exist
     */
    public EventResponse getPublicEventById(long id) {
        return eventRepository.findById(id)
                .map(this::toEventResponse)
                .orElseThrow(() ->
                        new EventNotFoundException(
                                "Event not found with id: " + id));
    }

    /**
     * Retrieves all events.
     *
     * @return list of all events
     */
    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::toEventResponse)
                .toList();
    }

    /**
     * Retrieves events registered by the authenticated user.
     *
     * @param userEmail authenticated user's email
     * @return list of registered events ordered by latest registration
     */
    @Transactional(readOnly = true)
    public List<MyRegisteredEventResponse> getRegisteredEventsForUser(String userEmail) {
        userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + userEmail));

        return eventRegistrationRepository.findByUser_EmailOrderByRegisteredAtDesc(userEmail)
                .stream()
                .map(this::toMyRegisteredEventResponse)
                .toList();
    }

    /**
     * Creates a new event.
     *
     * @param request event creation details
     * @return the saved event
     */
    @Transactional
    public EventResponse createEvent(EventCreateRequest request) {
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setCapacity(request.getCapacity());
        event.setImageUrl(request.getImageUrl());

        // Default to true if isPublic is null
        event.setPublic(request.getIsPublic() == null || request.getIsPublic());

        // Ensure registeredCount is 0 for new events
        event.setRegisteredCount(0);

        Event saved = eventRepository.save(event);
        return toEventResponse(saved);
    }

    /**
     * Updates an existing event.
     *
     * @param id ID of the event to update
     * @param request updated event details
     * @return the updated event
     * @throws EventNotFoundException if the event does not exist
     */
    @Transactional
    public EventResponse updateEvent(Long id, EventUpdateRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EventNotFoundException("Event not found with id: " + id));

        // Business Rule: Capacity cannot be less than current registrations
        if (request.getCapacity() != null && request.getCapacity() < event.getRegisteredCount()) {
            throw new RegistrationConflictException(
                    "Capacity cannot be reduced below the current number of registered users ("
                    + event.getRegisteredCount() + ")");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setCapacity(request.getCapacity());
        event.setPublic(request.getIsPublic() == null || request.getIsPublic());
        event.setImageUrl(request.getImageUrl());

        Event saved = eventRepository.save(event);
        return toEventResponse(saved);
    }

    /**
     * Deletes an existing event and its registrations.
     *
     * @param id ID of the event to delete
     * @throws EventNotFoundException if the event does not exist
     */
    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EventNotFoundException("Event not found with id: " + id));

        eventRegistrationRepository.deleteByEventId(id);
        eventRepository.delete(event);
    }

    /**
     * Registers the authenticated user for an event.
     *
     * <p>Business rules enforced:
     * <ol>
     *   <li>Event must exist → 404</li>
     *   <li>User must exist (resolved from JWT email) → 404</li>
     *   <li>User must not already be registered → 409</li>
     *   <li>Event must not be at capacity → 409</li>
     * </ol>
     *
     * @param eventId ID of the event to register for
     * @param userEmail email extracted from JWT principal
     * @return registration confirmation response
     */
    @Transactional
    public RegistrationResponse registerUserForEvent(Long eventId, String userEmail) {

        ObjectOptimisticLockingFailureException lastConflict = null;

        for (int attempt = 1; attempt <= MAX_REGISTRATION_RETRIES; attempt++) {
            try {
                return executeRegistration(eventId, userEmail);

            } catch (ObjectOptimisticLockingFailureException ex) {
                lastConflict = ex;

                log.warn(
                        "Optimistic lock conflict on event {} (attempt {}/{})",
                        eventId,
                        attempt,
                        MAX_REGISTRATION_RETRIES
                );
            }
        }

        log.error(
                "Registration failed after {} retries for event {} by {}",
                MAX_REGISTRATION_RETRIES,
                eventId,
                userEmail
        );

        throw new RegistrationConflictException(
                "Registration could not be completed due to high demand. Please try again.");
    }


    private RegistrationResponse executeRegistration(
            Long eventId,
            String userEmail) {

        Event event = eventRepository.findByIdWithLock(eventId)
                .orElseThrow(() ->
                        new EventNotFoundException(
                                "Event not found with id: " + eventId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + userEmail));

        if (event.getAttendees().contains(user)
                || eventRegistrationRepository.existsByEvent_IdAndUser_Email(eventId, userEmail)) {

            throw new RegistrationConflictException(
                    "You are already registered for this event.");
        }

        if (event.getCapacity() != null
                && event.getRegisteredCount() >= event.getCapacity()) {

            throw new EventFullException(
                    "Event is already full. Capacity: " + event.getCapacity());
        }

        event.getAttendees().add(user);
        event.setRegisteredCount(event.getAttendees().size());

        Event saved = eventRepository.save(event);

        EventRegistration registration = new EventRegistration();
        registration.setEvent(saved);
        registration.setUser(user);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setStatus("CONFIRMED");

        registration = eventRegistrationRepository.save(registration);

        Integer spotsRemaining =
                (saved.getCapacity() == null)
                        ? null
                        : Math.max(
                                0,
                                saved.getCapacity() - saved.getRegisteredCount());

        return RegistrationResponse.builder()
                .eventId(saved.getId())
                .eventTitle(saved.getTitle())
                .userEmail(userEmail)
                .registeredAt(registration.getRegisteredAt())
                .spotsRemaining(spotsRemaining)
                .registrationStatus(registration.getStatus())
                .build();
    }

    private MyRegisteredEventResponse toMyRegisteredEventResponse(
            EventRegistration registration) {

        Event event = registration.getEvent();

        return MyRegisteredEventResponse.builder()
                .registrationId(registration.getId())
                .eventId(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .eventDate(event.getEventDate())
                .registeredAt(registration.getRegisteredAt())
                .status(registration.getStatus())
                .imageUrl(event.getImageUrl())
                .build();
    }

    private EventResponse toEventResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .eventDate(event.getEventDate())
                .capacity(event.getCapacity())
                .registeredCount(event.getRegisteredCount())
                .isPublic(event.isPublic())
                .imageUrl(event.getImageUrl())
                .build();
    }
}
