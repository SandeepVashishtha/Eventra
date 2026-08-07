package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.CancelEventRequest;
import com.sandeep.eventrabackend.dto.request.EventCreateRequest;
import com.sandeep.eventrabackend.dto.request.EventUpdateRequest;
import com.sandeep.eventrabackend.dto.response.EventAvailabilityResponse;
import com.sandeep.eventrabackend.dto.response.AttendeeDirectoryResponse;
import com.sandeep.eventrabackend.dto.response.EventResponse;
import com.sandeep.eventrabackend.dto.response.MyRegisteredEventResponse;
import com.sandeep.eventrabackend.dto.response.PagedResponse;
import com.sandeep.eventrabackend.dto.response.RegistrationResponse;
import com.sandeep.eventrabackend.dto.response.WaitlistResponse;
import com.sandeep.eventrabackend.exception.EventFullException;
import com.sandeep.eventrabackend.exception.EventNotFoundException;
import com.sandeep.eventrabackend.exception.RegistrationClosedException;
import com.sandeep.eventrabackend.exception.RegistrationConflictException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.EventRegistration;
import com.sandeep.eventrabackend.model.EventRole;
import com.sandeep.eventrabackend.model.EventWaitlist;
import com.sandeep.eventrabackend.model.Notification;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventRegistrationRepository;
import com.sandeep.eventrabackend.repository.EventRepository;
<<<<<<< HEAD
import com.sandeep.eventrabackend.repository.EventSpecifications;
=======
import com.sandeep.eventrabackend.repository.EventRoleAuditLogRepository;
import com.sandeep.eventrabackend.repository.EventTeamMemberRepository;
>>>>>>> upstream/master
import com.sandeep.eventrabackend.repository.EventWaitlistRepository;
import com.sandeep.eventrabackend.repository.FeedbackAnalyticsRepository;
import com.sandeep.eventrabackend.repository.NotificationRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

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
    private final EventWaitlistRepository eventWaitlistRepository;
    private final NotificationRepository notificationRepository;
    private final EventTeamMemberRepository eventTeamMemberRepository;
    private final FeedbackAnalyticsRepository feedbackRepository;
    private final EventRoleAuditLogRepository eventRoleAuditLogRepository;
    private final UserRepository userRepository;
    private final EventRoleService eventRoleService;

    public EventService(
            EventRepository eventRepository,
            EventRegistrationRepository eventRegistrationRepository,
            EventWaitlistRepository eventWaitlistRepository,
            NotificationRepository notificationRepository,
            EventTeamMemberRepository eventTeamMemberRepository,
            FeedbackAnalyticsRepository feedbackRepository,
            EventRoleAuditLogRepository eventRoleAuditLogRepository,
            UserRepository userRepository,
            EventRoleService eventRoleService) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.eventWaitlistRepository = eventWaitlistRepository;
        this.notificationRepository = notificationRepository;
        this.eventTeamMemberRepository = eventTeamMemberRepository;
        this.feedbackRepository = feedbackRepository;
        this.eventRoleAuditLogRepository = eventRoleAuditLogRepository;
        this.userRepository = userRepository;
        this.eventRoleService = eventRoleService;
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
        return getEventAvailability(id, null);
    }

    public EventAvailabilityResponse getEventAvailability(Long id, String userEmail) {
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

        Integer waitlistPosition = null;
        if (userEmail != null) {
            waitlistPosition = eventWaitlistRepository
                    .findByEvent_IdAndUser_EmailAndStatus(id, userEmail, "WAITING")
                    .map(EventWaitlist::getPosition)
                    .orElse(null);
        }

        return EventAvailabilityResponse.builder()
                .capacity(capacity)
                .registeredCount(registeredCount)
                .spotsLeft(spotsLeft)
                .isFull(isFull)
                .eventPassed(event.isEventPast())
                .waitlistPosition(waitlistPosition)
                .waitlisted(waitlistPosition != null)
                .build();
    }

    // ── Issue #2102 — Event Fetch ─────────────────────────────────────

    /**
     * Retrieves a public event by ID.
     *
     * <p>Events that are explicitly marked not public are excluded from the
     * public read path (Issue #11230); they are only visible to their
     * organizer or an admin via the admin endpoints.</p>
     *
     * @throws EventNotFoundException if the event does not exist or is not public
     */
    public EventResponse getPublicEventById(long id) {
        return eventRepository.findById(id)
                .filter(Event::isPublic)
                .map(this::toEventResponse)
                .orElseThrow(() ->
                        new EventNotFoundException(
                                "Event not found with id: " + id));
    }

    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of("eventDate", "title", "id");

    private static final Map<String, String> SORT_ALIASES = Map.of(
            "date", "eventDate",
            "eventdate", "eventDate",
            "title", "title",
            "id", "id"
    );

    /**
     * Retrieves a page of public events with optional search / status / sort.
     */
    @Transactional(readOnly = true)
    public PagedResponse<EventResponse> getAllEvents(
            int page,
            int size,
            String search,
            List<String> statuses,
            String sort
    ) {
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        Specification<Event> spec = EventSpecifications.publicListing(search, statuses);
        Page<EventResponse> result = eventRepository.findAll(spec, pageable).map(this::toEventResponse);
        return PagedResponse.from(result);
    }

    private Sort resolveSort(String sort) {
        if (!StringUtils.hasText(sort)) {
            return Sort.by(Sort.Direction.DESC, "eventDate");
        }

        String[] parts = sort.split(",", 2);
        String rawProperty = parts[0].trim();
        String mapped = SORT_ALIASES.getOrDefault(rawProperty.toLowerCase(Locale.ROOT), rawProperty);
        if (!ALLOWED_SORT_PROPERTIES.contains(mapped)) {
            // Unsupported sorts (price, match, …) fall back to newest-first
            return Sort.by(Sort.Direction.DESC, "eventDate");
        }

        Sort.Direction direction = Sort.Direction.DESC;
        if (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())) {
            direction = Sort.Direction.ASC;
        }
        return Sort.by(direction, mapped);
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
    public EventResponse createEvent(EventCreateRequest request, String userEmail) {
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

        // Issue #11021 — record the authenticated creator as the event owner so
        // ownership-based authorization can be enforced on later management actions.
        User owner = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "User not found with email: " + userEmail));
        event.setOwnerId(owner.getId());

        Event saved = eventRepository.save(event);
        eventRoleService.assignOwner(saved, owner);
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
    public EventResponse updateEvent(Long id, EventUpdateRequest request, String userEmail) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EventNotFoundException("Event not found with id: " + id));

        eventRoleService.requireRole(id, userEmail, EventRole.ORGANIZER);

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
        if (request.getIsPublic() != null) {
            event.setPublic(request.getIsPublic());
        }
        event.setImageUrl(request.getImageUrl());

        Event saved = eventRepository.save(event);
        return toEventResponse(saved);
    }

    /**
     * Cancels an existing event.
     *
     * <p>Authorization (Issue #11021): only the event's own organizer or an
     * administrator (ADMIN / SUPER_ADMIN) may cancel an event. This closes the
     * broken object-level authorization hole where any ORGANIZER could cancel
     * events created by other organizers.</p>
     *
     * @param id        ID of the event to cancel
     * @param userEmail email extracted from JWT principal
     * @param request   cancellation details (reason, refund policy)
     * @return the updated (cancelled) event
     * @throws EventNotFoundException if the event does not exist
     */
    @Transactional
    public EventResponse cancelEvent(Long id, String userEmail, CancelEventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() ->
                        new EventNotFoundException("Event not found with id: " + id));

        eventRoleService.requireRole(id, userEmail, EventRole.ORGANIZER);

        if ("CANCELLED".equals(event.getStatus())) {
            throw new RegistrationConflictException("Event is already cancelled.");
        }

        String refundPolicy = request.getRefundPolicy().toUpperCase();
        if ("PARTIAL".equals(refundPolicy)) {
            if (request.getRefundPercent() == null) {
                throw new IllegalArgumentException(
                        "Refund percentage is required when the refund policy is PARTIAL.");
            }
        }

        event.setStatus("CANCELLED");
        event.setCancellationReason(request.getReason());
        event.setCancelledAt(request.getCancelledAt() != null ? request.getCancelledAt() : LocalDateTime.now());
        event.setRefundPolicy(refundPolicy);
        event.setRefundPercent("PARTIAL".equals(refundPolicy) ? request.getRefundPercent() : null);

        return toEventResponse(eventRepository.save(event));
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
        eventWaitlistRepository.deleteByEvent_Id(id);
        eventRepository.deleteAttendeeRowsByEventId(id);
        eventTeamMemberRepository.deleteByEvent_Id(id);
        feedbackRepository.deleteByEvent_Id(id);
        eventRoleAuditLogRepository.deleteByEventId(id);
        eventRepository.delete(event);
    }

    @Transactional
    public WaitlistResponse joinWaitlist(Long eventId, String userEmail) {
        Event event = eventRepository.findByIdWithLock(eventId)
                .orElseThrow(() ->
                        new EventNotFoundException("Event not found with id: " + eventId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + userEmail));

        if (eventRegistrationRepository.existsByEvent_IdAndUser_Email(eventId, userEmail)) {
            throw new RegistrationConflictException("You are already registered for this event.");
        }

        if (eventWaitlistRepository.existsByEvent_IdAndUser_EmailAndStatus(eventId, userEmail, "WAITING")) {
            throw new RegistrationConflictException("You are already on the waitlist for this event.");
        }

        if (event.getCapacity() == null || event.getRegisteredCount() < event.getCapacity()) {
            throw new RegistrationConflictException("This event still has open spots. Please register directly.");
        }

        EventWaitlist entry = new EventWaitlist();
        entry.setEvent(event);
        entry.setUser(user);
        entry.setPosition(eventWaitlistRepository.findMaxPositionByEventId(eventId) + 1);
        entry.setStatus("WAITING");

        return toWaitlistResponse(eventWaitlistRepository.save(entry));
    }

    @Transactional
    public void cancelRegistration(Long eventId, String userEmail) {
        Event event = eventRepository.findByIdWithLock(eventId)
                .orElseThrow(() ->
                        new EventNotFoundException("Event not found with id: " + eventId));

        EventRegistration registration = eventRegistrationRepository
                .findByEvent_IdAndUser_Email(eventId, userEmail)
                .orElseThrow(() ->
                        new RegistrationConflictException("You are not registered for this event."));

        User user = registration.getUser();
        eventRegistrationRepository.delete(registration);
        event.getAttendees().removeIf(attendee -> attendee.getId().equals(user.getId()));
        event.setRegisteredCount(Math.max(0, event.getRegisteredCount() - 1));
        eventRepository.save(event);

        promoteFirstWaitingUser(event);
    }

    @Transactional(readOnly = true)
    public List<WaitlistResponse> getEventWaitlist(Long eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

        eventRoleService.requireRole(eventId, userEmail, EventRole.ORGANIZER);

        return eventWaitlistRepository
                .findByEvent_IdAndStatusOrderByPositionAscJoinedAtAsc(eventId, "WAITING")
                .stream()
                .map(this::toWaitlistResponse)
                .toList();
    }

    @Transactional
    public void leaveWaitlist(Long eventId, String userEmail) {
        EventWaitlist entry = eventWaitlistRepository
                .findByEvent_IdAndUser_EmailAndStatus(eventId, userEmail, "WAITING")
                .orElseThrow(() ->
                        new RegistrationConflictException("You are not on the waitlist for this event."));

        entry.setStatus("REMOVED");
        eventWaitlistRepository.save(entry);
    }

    @Transactional
    public RegistrationResponse promoteWaitlistedUser(Long eventId, Long waitlistId, String userEmail) {
        Event event = eventRepository.findByIdWithLock(eventId)
                .orElseThrow(() ->
                        new EventNotFoundException("Event not found with id: " + eventId));

        eventRoleService.requireRole(eventId, userEmail, EventRole.ORGANIZER);

        EventWaitlist entry = eventWaitlistRepository.findById(waitlistId)
                .filter(waitlist -> waitlist.getEvent().getId().equals(eventId))
                .orElseThrow(() ->
                        new EventNotFoundException("Waitlist entry not found with id: " + waitlistId));

        if (!"WAITING".equals(entry.getStatus())) {
            throw new RegistrationConflictException("Waitlist entry is not waiting for promotion.");
        }

        if (event.getCapacity() != null && event.getRegisteredCount() >= event.getCapacity()) {
            throw new EventFullException("Event is already full. Capacity: " + event.getCapacity());
        }

        return promoteEntry(event, entry);
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
    public RegistrationResponse registerUserForEvent(Long eventId, String userEmail, String seatId) {
        return registerUserForEvent(eventId, userEmail, seatId, false);
    }

    @Transactional
    public RegistrationResponse registerUserForEvent(
            Long eventId,
            String userEmail,
            String seatId,
            boolean showProfileInAttendeeDirectory) {

        ObjectOptimisticLockingFailureException lastConflict = null;

        for (int attempt = 1; attempt <= MAX_REGISTRATION_RETRIES; attempt++) {
            try {
                return executeRegistration(eventId, userEmail, seatId, showProfileInAttendeeDirectory);

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
            String userEmail,
            String seatId,
            boolean showProfileInAttendeeDirectory) {

        Event event = eventRepository.findByIdWithLock(eventId)
                .orElseThrow(() ->
                        new EventNotFoundException(
                                "Event not found with id: " + eventId));

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
            throw new RegistrationConflictException(
                    "Seat " + seatId + " is already taken.");
        }

        event.setRegisteredCount((int) eventRegistrationRepository
                .countByEvent_IdAndStatus(eventId, "CONFIRMED"));
        Event saved = eventRepository.save(event);

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
                .seatId(registration.getSeatId())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AttendeeDirectoryResponse> getAttendeeDirectory(Long eventId, String userEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() ->
                        new EventNotFoundException("Event not found with id: " + eventId));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with email: " + userEmail));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.SUPER_ADMIN;
        boolean isOwner = event.getOwnerId() != null && event.getOwnerId().equals(currentUser.getId());
        boolean isRegistered = eventRegistrationRepository.existsByEvent_IdAndUser_Email(eventId, userEmail);

        if (!isAdmin && !isOwner && !isRegistered) {
            throw new AccessDeniedException("Only registered attendees can view this event's attendee directory.");
        }

        return eventRegistrationRepository
                .findByEvent_IdAndShowProfileInAttendeeDirectoryTrueOrderByRegisteredAtAsc(eventId)
                .stream()
                .map(this::toAttendeeDirectoryResponse)
                .toList();
    }

    private RegistrationResponse promoteFirstWaitingUser(Event event) {
        if (event.getCapacity() != null && event.getRegisteredCount() >= event.getCapacity()) {
            return null;
        }

        return eventWaitlistRepository.findWaitingByEventIdWithLock(event.getId())
                .stream()
                .findFirst()
                .map(entry -> promoteEntry(event, entry))
                .orElse(null);
    }

    private RegistrationResponse promoteEntry(Event event, EventWaitlist entry) {
        User user = entry.getUser();

        if (eventRegistrationRepository.existsByEvent_IdAndUser_Email(event.getId(), user.getEmail())) {
            entry.setStatus("REMOVED");
            eventWaitlistRepository.save(entry);
            return null;
        }

        event.getAttendees().add(user);

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setUser(user);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setStatus("CONFIRMED");
        registration = eventRegistrationRepository.save(registration);

        event.setRegisteredCount((int) eventRegistrationRepository
                .countByEvent_IdAndStatus(event.getId(), "CONFIRMED"));
        Event saved = eventRepository.save(event);

        entry.setStatus("PROMOTED");
        entry.setPromotedAt(LocalDateTime.now());
        eventWaitlistRepository.save(entry);

        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Waitlist spot opened")
                .message("A spot opened for " + saved.getTitle() + ". You have been automatically registered.")
                .build());

        Integer spotsRemaining =
                (saved.getCapacity() == null)
                        ? null
                        : Math.max(0, saved.getCapacity() - saved.getRegisteredCount());

        return RegistrationResponse.builder()
                .eventId(saved.getId())
                .eventTitle(saved.getTitle())
                .userEmail(user.getEmail())
                .registeredAt(registration.getRegisteredAt())
                .spotsRemaining(spotsRemaining)
                .registrationStatus(registration.getStatus())
                .seatId(registration.getSeatId())
                .build();
    }

    /**
     * Returns the seat identifiers already reserved for an event, used by the
     * seat selector to derive live, cross-browser occupancy.
     *
     * @param eventId ID of the event
     * @return list of reserved seat identifiers (e.g. {@code table-1:3})
     */
    @Transactional(readOnly = true)
    public List<String> getOccupiedSeats(Long eventId) {
        return eventRegistrationRepository.findByEvent_Id(eventId)
                .stream()
                .map(EventRegistration::getSeatId)
                .filter(seatId -> seatId != null && !seatId.isBlank())
                .toList();
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
                .ownerId(event.getOwnerId())
                .status(event.getStatus())
                .cancellationReason(event.getCancellationReason())
                .cancelledAt(event.getCancelledAt())
                .refundPolicy(event.getRefundPolicy())
                .refundPercent(event.getRefundPercent())
                .build();
    }

    private WaitlistResponse toWaitlistResponse(EventWaitlist entry) {
        return WaitlistResponse.builder()
                .id(entry.getId())
                .eventId(entry.getEvent().getId())
                .eventTitle(entry.getEvent().getTitle())
                .userEmail(entry.getUser().getEmail())
                .position(entry.getPosition())
                .status(entry.getStatus())
                .joinedAt(entry.getJoinedAt())
                .build();
    }

    private AttendeeDirectoryResponse toAttendeeDirectoryResponse(EventRegistration registration) {
        User user = registration.getUser();
        String displayName = (user.getFirstName() + " " + user.getLastName()).trim();

        return AttendeeDirectoryResponse.builder()
                .userId(user.getId())
                .displayName(displayName.isBlank() ? user.getUsername() : displayName)
                .username(user.getUsername())
                .profileHeadline(user.getProfileHeadline())
                .linkedinUrl(user.getLinkedinUrl())
                .githubUrl(user.getGithubUrl())
                .registeredAt(registration.getRegisteredAt())
                .build();
    }
}
