package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.request.CancelEventRequest;
import com.sandeep.eventrabackend.dto.request.CsvWaitlistImportRequest;
import com.sandeep.eventrabackend.dto.request.EventCreateRequest;
import com.sandeep.eventrabackend.dto.request.EventScheduleRequest;
import com.sandeep.eventrabackend.dto.request.EventUpdateRequest;
import com.sandeep.eventrabackend.dto.response.CsvWaitlistImportResponse;
import com.sandeep.eventrabackend.dto.response.EventAvailabilityResponse;
import com.sandeep.eventrabackend.dto.response.AttendeeDirectoryResponse;
import com.sandeep.eventrabackend.dto.response.EventResponse;
import com.sandeep.eventrabackend.dto.response.EventScheduleResponse;
import com.sandeep.eventrabackend.dto.response.EventRegistrantResponse;
import com.sandeep.eventrabackend.dto.response.MyRegisteredEventResponse;
import com.sandeep.eventrabackend.dto.response.PagedResponse;
import com.sandeep.eventrabackend.dto.response.RegistrantsPageResponse;
import com.sandeep.eventrabackend.dto.response.RegistrationResponse;
import com.sandeep.eventrabackend.dto.response.AchievementBadgeResponse;
import com.sandeep.eventrabackend.dto.response.UserAchievementsResponse;
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
import com.sandeep.eventrabackend.repository.EventRoleAuditLogRepository;
import com.sandeep.eventrabackend.repository.EventSpecifications;
import com.sandeep.eventrabackend.repository.EventTeamMemberRepository;
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
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service handling event queries and registrations.
 *
 * <h3>Concurrency strategy (Issue #2104)</h3>
 * <ul>
 * <li><b>Pessimistic write lock</b> ({@code SELECT … FOR UPDATE}) is acquired
 * via {@link EventRepository#findByIdWithLock} at the start of every
 * registration transaction. Only one thread can hold the lock at a time,
 * so the capacity check and the attendee-set mutation are serialised.</li>
 * <li><b>Optimistic version field</b> ({@code @Version} on {@link Event}) acts
 * as a safety net: if two transactions somehow both pass the lock path and
 * attempt to commit, JPA will reject the second with an
 * {@link ObjectOptimisticLockingFailureException}, which the
 * {@code GlobalExceptionHandler} converts to HTTP 409.</li>
 * <li>A <b>retry loop</b> (max {@value #MAX_REGISTRATION_RETRIES} attempts)
 * transparently re-tries on optimistic conflicts so transient contention
 * does not surface as an error to the caller.</li>
 * </ul>
 */
@Service
public class EventService {

        private static final Logger log = LoggerFactory.getLogger(EventService.class);

        /** Maximum number of automatic retries on optimistic-lock conflict. */
        private static final int MAX_REGISTRATION_RETRIES = 3;

        /** Safety cap so waitlist promotion can never loop without bound. */
        private static final int MAX_PROMOTIONS_PER_CALL = 50;

        private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of("eventDate", "title", "id");

        private static final Map<String, String> SORT_ALIASES = Map.of(
                        "date", "eventDate",
                        "eventdate", "eventDate",
                        "title", "title",
                        "id", "id");

        /**
         * Allowlist for the public listing {@code status} filter. Restricts the
         * public endpoint to timing/lifecycle labels that are safe to expose so
         * callers cannot request internal states (e.g. DRAFT, ARCHIVED, INTERNAL)
         * via the filter.
         */
        private static final Set<String> ALLOWED_PUBLIC_STATUSES = Set.of(
                        "PUBLISHED", "UPCOMING", "ONGOING", "COMPLETED",
                        "LIVE", "PAST", "ENDED", "CANCELLED", "CANCELED", "SCHEDULED");

        /** Maximum page index accepted by the public listing (DoS guard). */
        private static final int MAX_EVENTS_PAGE = 1000;

        /** Maximum length (chars) of the public listing search term. */
        private static final int MAX_EVENTS_SEARCH_LENGTH = 200;

        private final EventRepository eventRepository;
        private final EventRegistrationRepository eventRegistrationRepository;
        private final EventWaitlistRepository eventWaitlistRepository;
        private final NotificationRepository notificationRepository;
        private final EventTeamMemberRepository eventTeamMemberRepository;
        private final FeedbackAnalyticsRepository feedbackRepository;
        private final EventRoleAuditLogRepository eventRoleAuditLogRepository;
        private final UserRepository userRepository;
        private final EventRoleService eventRoleService;
        private final EventStreamService eventStreamService;
        private final StripeService stripeService;

        public EventService(
                        EventRepository eventRepository,
                        EventRegistrationRepository eventRegistrationRepository,
                        EventWaitlistRepository eventWaitlistRepository,
                        NotificationRepository notificationRepository,
                        EventTeamMemberRepository eventTeamMemberRepository,
                        FeedbackAnalyticsRepository feedbackRepository,
                        EventRoleAuditLogRepository eventRoleAuditLogRepository,
                        UserRepository userRepository,
                        EventRoleService eventRoleService,
                        EventStreamService eventStreamService,
                        StripeService stripeService) {
                this.eventRepository = eventRepository;
                this.eventRegistrationRepository = eventRegistrationRepository;
                this.eventWaitlistRepository = eventWaitlistRepository;
                this.notificationRepository = notificationRepository;
                this.eventTeamMemberRepository = eventTeamMemberRepository;
                this.feedbackRepository = feedbackRepository;
                this.eventRoleAuditLogRepository = eventRoleAuditLogRepository;
                this.userRepository = userRepository;
                this.eventRoleService = eventRoleService;
                this.eventStreamService = eventStreamService;
                this.stripeService = stripeService;
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
                Event event = requirePublicEvent(id);

                Integer capacity = event.getCapacity();
                int registeredCount = event.getRegisteredCount();

                Integer spotsLeft = (capacity == null)
                                ? null
                                : Math.max(0, capacity - registeredCount);

                boolean isFull = (capacity != null) && (registeredCount >= capacity);

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
         * Retrieves a public event by ID.
         *
         * <p>
         * Events that are explicitly marked not public are excluded from the
         * public read path (Issue #11230); they are only visible to their
         * organizer or an admin via the admin endpoints. Cancelled events are
         * likewise excluded from the public read path (Issue #12081).
         * </p>
         *
         * @throws EventNotFoundException if the event does not exist or is not public
         */
        public EventResponse getPublicEventById(long id) {
                return eventRepository.findById(id)
                                .filter(Event::isPublic)
                                .filter(event -> !"CANCELLED".equals(event.getStatus()))
                                .map(this::toPublicEventResponse)
                                .orElseThrow(() -> new EventNotFoundException(
                                                "Event not found with id: " + id));
        }

        private Event requirePublicEvent(Long id) {
                return eventRepository.findById(id)
                                .filter(Event::isPublic)
                                .filter(event -> !"CANCELLED".equals(event.getStatus()))
                                .filter(event -> !"DELETED".equals(event.getStatus()))
                                .orElseThrow(() -> new EventNotFoundException(
                                                "Event not found with id: " + id));
        }

        /**
         * Retrieves a page of public events with optional search / status / sort.
         */
        @Transactional(readOnly = true)
        public PagedResponse<EventResponse> getAllEvents(
                        int page,
                        int size,
                        String search,
                        List<String> statuses,
                        String sort) {
                if (statuses != null) {
                        for (String raw : statuses) {
                                if (raw == null) {
                                        continue;
                                }
                                String status = raw.trim().toUpperCase(Locale.ROOT);
                                if (!status.isEmpty() && !ALLOWED_PUBLIC_STATUSES.contains(status)) {
                                        throw new IllegalArgumentException(
                                                        "Invalid status filter '" + raw + "'. Allowed values: "
                                                                        + String.join(", ", ALLOWED_PUBLIC_STATUSES));
                                }
                        }
                }
                if (search != null && search.length() > MAX_EVENTS_SEARCH_LENGTH) {
                        throw new IllegalArgumentException(
                                        "Search term must not exceed " + MAX_EVENTS_SEARCH_LENGTH + " characters");
                }
                int safePage = Math.min(Math.max(0, page), MAX_EVENTS_PAGE);
                int safeSize = (size <= 0) ? 20 : Math.min(size, 100);
                Pageable pageable = PageRequest.of(safePage, safeSize, resolveSort(sort));
                Specification<Event> spec = EventSpecifications.publicListing(search, statuses);
                Page<EventResponse> result = eventRepository.findAll(spec, pageable).map(this::toPublicEventResponse);
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
                        throw new IllegalArgumentException(
                                        "Unsupported sort property '" + rawProperty + "'. Allowed values: "
                                                        + String.join(", ", ALLOWED_SORT_PROPERTIES));
                }

                Sort.Direction direction = Sort.Direction.DESC;
                if (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())) {
                        direction = Sort.Direction.ASC;
                }
                return Sort.by(direction, mapped);
        }

        private void validateTitle(String title) {
                if (title == null || title.trim().length() < 3 || title.trim().length() > 100) {
                        throw new IllegalArgumentException("Title must be between 3 and 100 characters.");
                }
        }

        /**
         * Returns a bounded window of public events near {@code around} for conflict
         * alternative suggestions (avoids loading the entire catalog).
         */
        @Transactional(readOnly = true)
        public List<EventResponse> findAlternativeEvents(
                        Long excludeEventId,
                        LocalDateTime around,
                        int windowDays,
                        int limit) {

                LocalDateTime center = around != null ? around : LocalDateTime.now();
                int days = Math.min(Math.max(windowDays, 1), 90);
                int size = Math.min(Math.max(limit, 1), 50);
                LocalDateTime from = center.minusDays(days);
                LocalDateTime to = center.plusDays(days);

                return eventRepository
                                .findPublicAlternativesInWindow(
                                                excludeEventId,
                                                from,
                                                to,
                                                org.springframework.data.domain.PageRequest.of(0, size))
                                .stream()
                                .map(this::toPublicEventResponse)
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
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with email: " + userEmail));

                return eventRegistrationRepository.findByUser_EmailOrderByRegisteredAtDesc(userEmail)
                                .stream()
                                .map(this::toMyRegisteredEventResponse)
                                .toList();
        }

        @Transactional(readOnly = true)
        public UserAchievementsResponse getAchievementsForUser(String userEmail) {
                userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with email: " + userEmail));

                List<EventRegistration> registrations =
                                eventRegistrationRepository.findByUser_EmailOrderByRegisteredAtDesc(userEmail);
                long totalEvents = registrations.stream()
                                .filter(registration -> "CONFIRMED".equals(registration.getStatus()))
                                .count();
                long gssocEvents = registrations.stream()
                                .filter(registration -> "CONFIRMED".equals(registration.getStatus()))
                                .filter(registration -> isGssocEvent(registration.getEvent()))
                                .count();
                int currentStreak = calculateCurrentStreak(registrations);

                return UserAchievementsResponse.builder()
                                .totalEvents(totalEvents)
                                .gssocEvents(gssocEvents)
                                .currentStreak(currentStreak)
                                .badges(List.of(
                                                buildBadge("first-step", "First Step",
                                                                "Registered for your first event.", totalEvents, 1),
                                                buildBadge("active-attendee", "Active Attendee",
                                                                "Registered for five events.", totalEvents, 5),
                                                buildBadge("streak-builder", "Streak Builder",
                                                                "Attended events on three consecutive days.",
                                                                currentStreak, 3),
                                                buildBadge("gssoc-explorer", "GSSoC Explorer",
                                                                "Joined two GSSoC-tagged events.", gssocEvents, 2)))
                                .build();
        }

        private AchievementBadgeResponse buildBadge(
                        String id,
                        String name,
                        String description,
                        long currentProgress,
                        long targetProgress) {
                return AchievementBadgeResponse.builder()
                                .id(id)
                                .name(name)
                                .description(description)
                                .currentProgress(currentProgress)
                                .targetProgress(targetProgress)
                                .earned(currentProgress >= targetProgress)
                                .build();
        }

        private boolean isGssocEvent(Event event) {
                if (event == null) {
                        return false;
                }
                String haystack = String.join(" ",
                                String.valueOf(event.getTitle()),
                                String.valueOf(event.getDescription()),
                                String.valueOf(event.getCategory()),
                                String.join(" ", event.getTags()))
                                .toLowerCase(Locale.ROOT);
                return haystack.contains("gssoc") || haystack.contains("girlscript");
        }

        private int calculateCurrentStreak(List<EventRegistration> registrations) {
                LocalDate today = LocalDate.now();
                LinkedHashSet<LocalDate> dates = registrations.stream()
                                .filter(registration -> "CONFIRMED".equals(registration.getStatus()))
                                .map(EventRegistration::getEvent)
                                .filter(event -> event != null && event.getEventDate() != null)
                                .map(event -> event.getEventDate().toLocalDate())
                                .filter(date -> !date.isAfter(today))
                                .sorted(java.util.Comparator.reverseOrder())
                                .collect(Collectors.toCollection(LinkedHashSet::new));

                int streak = 0;
                // A current streak may end today or yesterday.
                LocalDate expected = dates.contains(today) ? today : today.minusDays(1);
                for (LocalDate date : dates) {
                        if (date.equals(expected)) {
                                streak++;
                                expected = date.minusDays(1);
                        } else if (date.isBefore(expected)) {
                                break;
                        }
                }
                return streak;
        }

        /**
         * Search and filter events based on multiple criteria.
         *
         * @param search    Search term for full-text search on title and description
         * @param category  Event category for filtering
         * @param startDate Start date for filtering (ISO format)
         * @param endDate   End date for filtering (ISO format)
         * @param free      Filter for free events only
         * @return List of events matching the search criteria
         */
        @Transactional(readOnly = true)
        public Page<EventResponse> searchEvents(String search, String category, String startDate, String endDate,
                        Boolean free, Pageable pageable) {
                // Push all filtering down to the database via a dynamic Specification.
                Specification<Event> spec = Specification
                                .where(EventSpecifications.isPublic())
                                .and(EventSpecifications.notCancelled())
                                .and(EventSpecifications.searchContains(search))
                                .and(EventSpecifications.categoryEquals(category))
                                .and(EventSpecifications.eventDateAfter(startDate))
                                .and(EventSpecifications.eventDateBefore(endDate));

                // Events do not currently model price, so a free filter cannot be applied.
                // Do not use capacity as a proxy for price.
                if (free != null && free) {
                        // Intentionally no-op until pricing data is available.
                }

                Page<Event> page = eventRepository.findAll(spec, pageable);
                return page.map(this::toPublicEventResponse);
        }

        /**
         * Calculates total event count per category directly in the database (Issue #16693).
         * Uses database GROUP BY aggregation to avoid loading all Event entities into memory.
         *
         * @return Map of category names to event counts
         */
        @Transactional(readOnly = true)
        public Map<String, Long> getEventCountByCategory() {
                List<Object[]> results = eventRepository.countEventsByCategory();
                Map<String, Long> categoryCounts = new LinkedHashMap<>();
                for (Object[] row : results) {
                        if (row[0] != null) {
                                categoryCounts.put((String) row[0], ((Number) row[1]).longValue());
                        }
                }
                return categoryCounts;
        }

        private static final Set<String> ALLOWED_CATEGORIES = Set.of(
                "Tech", "Art", "Music", "Sports", "Education", "Networking", "Other"
        );

        private void validateEventCategories(Set<String> categories) {
                if (categories == null) return;
                for (String category : categories) {
                        if (!ALLOWED_CATEGORIES.contains(category)) {
                                throw new IllegalArgumentException("Invalid event category: " + category);
                        }
                }
        }

        private void validateEventCategory(String category) {
                if (category == null || category.isBlank()) return;
                if (!ALLOWED_CATEGORIES.contains(category)) {
                        throw new IllegalArgumentException("Invalid event category: " + category);
                }
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
                validateEventCategory(request.getCategory());
                validateEventCategories(request.getCategories());
                validateTitle(request.getTitle());
                event.setTitle(request.getTitle());
                validateDescription(request.getDescription());
                event.setDescription(request.getDescription());
                validateLocation(request.getLocation());
                event.setLocation(request.getLocation());
                event.setEventDate(request.getEventDate());
                event.setCapacity(request.getCapacity());
                event.setImageUrl(request.getImageUrl());
                validateEventTags(request.getTags());
                event.setCategory(request.getCategory());
                if (request.getCategories() != null) {
                    event.setCategories(new HashSet<>(request.getCategories()));
                }
                if (request.getTags() != null) {
                        event.setTags(new HashSet<>(request.getTags()));
                }

                // Default to true if isPublic is null
                event.setPublic(request.getIsPublic() == null || request.getIsPublic());

                // Ensure registeredCount is 0 for new events
                event.setRegisteredCount(0);

                // Issue #11021 — record the authenticated creator as the event owner so
                // ownership-based authorization can be enforced on later management actions.
                User owner = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with email: " + userEmail));
                event.setOwnerId(owner.getId());

                Event saved = eventRepository.save(event);
                eventRoleService.assignOwner(saved, owner);
                return toEventResponse(saved);
        }

        /**
         * Updates an existing event.
         *
         * @param id      ID of the event to update
         * @param request updated event details
         * @return the updated event
         * @throws EventNotFoundException if the event does not exist
         */
        @Transactional
        public EventResponse updateEvent(Long id, EventUpdateRequest request, String userEmail) {
                Event event = eventRepository.findById(id)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));

                eventRoleService.requireRole(id, userEmail, EventRole.ORGANIZER);

                // Business Rule: Capacity cannot be less than current registrations
                if (request.getCapacity() != null && request.getCapacity() < event.getRegisteredCount()) {
                        throw new RegistrationConflictException(
                                        "Capacity cannot be reduced below the current number of registered users ("
                                                        + event.getRegisteredCount() + ")");
                }

                Integer previousCapacity = event.getCapacity();
                validateEventCategory(request.getCategory());
                validateEventCategories(request.getCategories());

                validateTitle(request.getTitle());
                event.setTitle(request.getTitle());
                if (request.getLocation() != null) {
                        validateLocation(request.getLocation());
                }
                event.setLocation(request.getLocation());
                event.setEventDate(request.getEventDate());
                if (request.getDescription() != null) {
                        validateDescription(request.getDescription());
                        event.setDescription(request.getDescription());
                }
                if (request.getCapacity() != null) {
                        event.setCapacity(request.getCapacity());
                }
                if (request.getIsPublic() != null) {
                        event.setPublic(request.getIsPublic());
                }
                if (request.getImageUrl() != null) {
                        event.setImageUrl(request.getImageUrl());
                }
                validateEventTags(request.getTags());
                if (request.getCategory() != null) {
                        event.setCategory(request.getCategory());
                }
                if (request.getCategories() != null) {
                    event.setCategories(new HashSet<>(request.getCategories()));
                }
                if (request.getTags() != null) {
                        event.setTags(new HashSet<>(request.getTags()));
                }

                Event saved = eventRepository.save(event);

                // Capacity increase frees seats — promote waitlisted users (same helper as cancel/admin)
                boolean capacityIncreased = request.getCapacity() != null
                                && previousCapacity != null
                                && request.getCapacity() > previousCapacity;
                if (capacityIncreased) {
                        int freedSeats = request.getCapacity() - previousCapacity;
                        for (int i = 0; i < freedSeats; i++) {
                                promoteWaitlistAfterVacancy(saved.getId());
                        }
                        saved = eventRepository.findById(saved.getId()).orElse(saved);
                }

                return toEventResponse(saved);
        }

        @Transactional(readOnly = true)
        public EventScheduleResponse getEventSchedule(Long id) {
                Event event = requirePublicEvent(id);
                return toEventScheduleResponse(event);
        }

        @Transactional
        public EventScheduleResponse updateEventSchedule(Long id, EventScheduleRequest request, String userEmail) {
                Event event = eventRepository.findById(id)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));
                eventRoleService.requireRole(id, userEmail, EventRole.ORGANIZER);

                if (request.getStartDate() == null) {
                        throw new IllegalArgumentException("Schedule startDate is required.");
                }
                if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
                        throw new IllegalArgumentException("Schedule endDate must be after startDate.");
                }

                event.setEventDate(request.getStartDate());
                event.setEndDate(request.getEndDate());
                Event saved = eventRepository.save(event);
                return toEventScheduleResponse(saved);
        }

        private EventScheduleResponse toEventScheduleResponse(Event event) {
                return EventScheduleResponse.builder()
                                .eventId(event.getId())
                                .startDate(event.getEventDate())
                                .endDate(event.getEndDate() != null ? event.getEndDate() : event.getEventDate())
                                .build();
        }

        /**
         * Cancels an existing event.
         *
         * <p>
         * Authorization (Issue #11021): only the event's own organizer or an
         * administrator (ADMIN / SUPER_ADMIN) may cancel an event. This closes the
         * broken object-level authorization hole where any ORGANIZER could cancel
         * events created by other organizers.
         * </p>
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
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));

                eventRoleService.requireRole(id, userEmail, EventRole.ORGANIZER);

                if ("CANCELLED".equals(event.getStatus())) {
                        // Idempotency guard: calling cancel twice must not re-send
                        // notifications or re-process refunds.
                        return toEventResponse(event);
                }

                String refundPolicy = request.getRefundPolicy() == null
                                ? null
                                : request.getRefundPolicy().toUpperCase();
                if (refundPolicy == null
                                || !("FULL".equals(refundPolicy)
                                || "PARTIAL".equals(refundPolicy)
                                || "NONE".equals(refundPolicy))) {
                        throw new IllegalArgumentException(
                                        "Refund policy is required and must be one of: FULL, PARTIAL, NONE");
                }
                if ("PARTIAL".equals(refundPolicy)) {
                        if (request.getRefundPercent() == null) {
                                throw new IllegalArgumentException(
                                                "Refund percentage is required when the refund policy is PARTIAL.");
                        }
                        if (request.getRefundPercent() < 1 || request.getRefundPercent() > 100) {
                                throw new IllegalArgumentException(
                                                "Refund percentage must be between 1 and 100 when the refund policy is PARTIAL.");
                        }
                }

                event.setStatus("CANCELLED");
                event.setCancellationReason(request.getReason());
                event.setCancelledAt(request.getCancelledAt() != null ? request.getCancelledAt() : LocalDateTime.now());
                event.setRefundPolicy(refundPolicy);
                event.setRefundPercent("PARTIAL".equals(refundPolicy) ? request.getRefundPercent() : null);

                Event saved = eventRepository.save(event);
                if (!Boolean.FALSE.equals(request.getNotifyAttendees())) {
                        notifyCancellation(saved, request.getReason());
                }

                return toEventResponse(saved);
        }

        @Transactional
        public EventResponse archiveEvent(Long id, String userEmail) {
                Event event = eventRepository.findById(id)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));

                eventRoleService.requireRole(id, userEmail, EventRole.ORGANIZER);

                if ("CANCELLED".equals(event.getStatus())) {
                        throw new RegistrationConflictException("Cancelled events cannot be archived.");
                }
                if ("ARCHIVED".equals(event.getStatus())) {
                        throw new RegistrationConflictException("Event is already archived.");
                }

                event.setStatus("ARCHIVED");
                Event saved = eventRepository.save(event);
                return toEventResponse(saved);
        }

        @Transactional
        public void resendCancellationNotice(Long eventId, String actorEmail, String attendeeEmail) {
                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
                eventRoleService.requireRole(eventId, actorEmail, EventRole.ORGANIZER);

                if (!"CANCELLED".equals(event.getStatus())) {
                        throw new RegistrationConflictException("Event is not cancelled.");
                }

                EventRegistration registration = eventRegistrationRepository
                                .findByEvent_IdAndUser_Email(eventId, attendeeEmail)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "No registration found for attendee: " + attendeeEmail));

                String reason = event.getCancellationReason() != null ? event.getCancellationReason()
                                : "Event cancelled";
                notificationRepository.save(Notification.builder()
                                .user(registration.getUser())
                                .title("Event cancelled")
                                .message(event.getTitle() + " has been cancelled. Reason: " + reason)
                                .build());
        }

        @Transactional(readOnly = true)
        public List<String> getNotifiedAttendees(Long eventId, String actorEmail) {
                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
                eventRoleService.requireRole(eventId, actorEmail, EventRole.ORGANIZER);

                if (!"CANCELLED".equals(event.getStatus())) {
                        return List.of();
                }

                java.util.LinkedHashSet<String> emails = new java.util.LinkedHashSet<>();
                eventRegistrationRepository.findByEvent_IdAndStatus(eventId, "CONFIRMED").stream()
                                .map(registration -> registration.getUser().getEmail())
                                .forEach(emails::add);
                eventWaitlistRepository
                                .findByEvent_IdAndStatusOrderByPositionAscJoinedAtAsc(eventId,
                                                EventWaitlist.STATUS_EVENT_CANCELLED)
                                .stream()
                                .map(entry -> entry.getUser().getEmail())
                                .forEach(emails::add);
                return List.copyOf(emails);
        }

        private void notifyCancellation(Event event, String reason) {
                String message = event.getTitle() + " has been cancelled. Reason: " + reason;
                String refundPolicy = event.getRefundPolicy();
                Integer refundPercent = event.getRefundPercent();
                boolean refundDue = refundPolicy != null
                                && !"NONE".equalsIgnoreCase(refundPolicy);

                eventRegistrationRepository.findByEvent_IdAndStatus(event.getId(), "CONFIRMED")
                                .forEach(registration -> {
                                        notificationRepository.save(Notification.builder()
                                                        .user(registration.getUser())
                                                        .title("Event cancelled")
                                                        .message(message)
                                                        .build());

                                        if (refundDue
                                                        && registration.isPaymentCompleted()
                                                        && registration.getStripePaymentIntentId() != null) {
                                                try {
                                                        stripeService.refundPayment(
                                                                        registration.getStripePaymentIntentId(),
                                                                        refundPolicy,
                                                                        refundPercent);
                                                } catch (Exception e) {
                                                        log.error(
                                                                        "Failed to refund payment for registration {} on cancelled event {}: {}",
                                                                        registration.getId(),
                                                                        event.getId(),
                                                                        e.getMessage());
                                                }
                                        }
                                });

                eventWaitlistRepository
                                .findByEvent_IdAndStatusOrderByPositionAscJoinedAtAsc(event.getId(),
                                                EventWaitlist.STATUS_WAITING)
                                .forEach(entry -> {
                                        notificationRepository.save(Notification.builder()
                                                        .user(entry.getUser())
                                                        .title("Event cancelled")
                                                        .message(message)
                                                        .build());
                                        entry.setStatus(EventWaitlist.STATUS_EVENT_CANCELLED);
                                        eventWaitlistRepository.save(entry);
                                });
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
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));

                eventRegistrationRepository.deleteByEventId(id);
                eventWaitlistRepository.deleteByEvent_Id(id);
                        eventTeamMemberRepository.deleteByEvent_Id(id);
                feedbackRepository.deleteByEvent_Id(id);
                eventRoleAuditLogRepository.deleteByEventId(id);
                eventRepository.delete(event);
        }

        @Transactional
        public WaitlistResponse joinWaitlist(Long eventId, String userEmail) {
                Event event = eventRepository.findByIdWithLock(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

                if (!event.isPublic()) {
                        throw new EventNotFoundException("Event not found with id: " + eventId);
                }

                // A cancelled event must never accept new waitlist joins (#12080).
                if ("CANCELLED".equals(event.getStatus())) {
                        throw new RegistrationConflictException("This event has been cancelled.");
                }

                // A past event will never reopen seats, so joining its waitlist would strand the user (#15283).
                if (event.isEventPast()) {
                        throw new RegistrationClosedException("Registration is closed for this event.");
                }

                User user = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with email: " + userEmail));

                if (eventRegistrationRepository.existsByEvent_IdAndUser_Email(eventId, userEmail)) {
                        throw new RegistrationConflictException("You are already registered for this event.");
                }

                if (eventWaitlistRepository.existsByEvent_IdAndUser_EmailAndStatus(eventId, userEmail, "WAITING")) {
                        throw new RegistrationConflictException("You are already on the waitlist for this event.");
                }

                if (event.getCapacity() == null || event.getRegisteredCount() < event.getCapacity()) {
                        throw new RegistrationConflictException(
                                        "This event still has open spots. Please register directly.");
                }

                for (int attempt = 1; attempt <= MAX_REGISTRATION_RETRIES; attempt++) {
                        EventWaitlist entry = new EventWaitlist();
                        entry.setEvent(event);
                        entry.setUser(user);
                        int maxPosition = eventWaitlistRepository.findByEvent_IdWithLock(eventId)
                                        .stream()
                                        .mapToInt(EventWaitlist::getPosition)
                                        .max()
                                        .orElse(0);
                        entry.setPosition(maxPosition + 1);
                        entry.setStatus("WAITING");

                        try {
                                return toWaitlistResponse(eventWaitlistRepository.saveAndFlush(entry));
                        } catch (DataIntegrityViolationException ex) {
                                String details = String.valueOf(ex.getMostSpecificCause() != null
                                                ? ex.getMostSpecificCause().getMessage()
                                                : ex.getMessage()).toLowerCase();
                                if (details.contains("uk_event_waitlist_event_position")
                                                || details.contains("position")) {
                                        continue;
                                }
                                if (details.contains("user") || details.contains("event_id")) {
                                        throw new RegistrationConflictException(
                                                        "You are already on the waitlist for this event.");
                                }
                                throw ex;
                        }
                }

                throw new RegistrationConflictException(
                                "Could not join waitlist due to high demand. Please try again.");
        }

        @Transactional
        public void cancelRegistration(Long eventId, String userEmail) {
                Event event = eventRepository.findByIdWithLock(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

                EventRegistration registration = eventRegistrationRepository
                                .findByEvent_IdAndUser_Email(eventId, userEmail)
                                .orElseThrow(() -> new RegistrationConflictException(
                                                "You are not registered for this event."));

                eventRegistrationRepository.delete(registration);
                event.setRegisteredCount((int) eventRegistrationRepository
                                .countByEvent_IdAndStatus(eventId, "CONFIRMED"));

                broadcastAvailability(event);

                promoteWaitlistAfterVacancy(eventId);
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

        /**
         * Bulk imports legacy waitlist data from CSV for organizers migrating from other systems.
         * 
         * <p>This method processes CSV entries containing Name, Email, and Timestamp, maps them to
         * existing users in the system, sorts by the legacy timestamp to maintain fair queuing,
         * and bulk-inserts them into the database as WAITING entries.</p>
         * 
         * <p>Each entry must have a corresponding user with the email address in the system.
         * If a user doesn't exist, that entry is skipped and added to the failure list.</p>
         * 
         * @param request The CSV import request containing eventId and list of entries
         * @param organizerEmail The email of the organizer performing the import
         * @return Response containing import statistics and failure details
         */
        /**
         * Parse timestamp string with various format support.
         */
        private LocalDateTime parseTimestamp(String timestampStr) {
                if (timestampStr == null || timestampStr.trim().isEmpty()) {
                    return LocalDateTime.now();
                }
                
                String timestamp = timestampStr.trim();
                
                // Try ISO date-time format first (e.g., 2024-01-15T10:30:00Z)
                try {
                    return LocalDateTime.parse(timestamp.replace("Z", ""));
                } catch (Exception e) {
                    // Ignored, try next format
                }
                
                // Try with space separator (e.g., 2024-01-15 10:30:00)
                try {
                    return LocalDateTime.parse(timestamp.replace(" ", "T"));
                } catch (Exception e) {
                    // Ignored, try next format
                }
                
                // Try date only (e.g., 2024-01-15)
                try {
                    return LocalDateTime.parse(timestamp + "T00:00:00");
                } catch (Exception e) {
                    // Ignored, try next format
                }
                
                // Fall back to current time
                return LocalDateTime.now();
        }

        @Transactional
        public CsvWaitlistImportResponse importLegacyWaitlist(CsvWaitlistImportRequest request, String organizerEmail) {
                Long eventId = request.getEventId();
                List<CsvWaitlistImportRequest.CsvWaitlistEntry> entries = request.getEntries();
                
                // Validate event exists and organizer has permission (use findByIdWithLock to serialize waitlist position updates)
                Event event = eventRepository.findByIdWithLock(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));
                
                eventRoleService.requireRole(eventId, organizerEmail, EventRole.ORGANIZER);
                
                CsvWaitlistImportResponse response = new CsvWaitlistImportResponse();
                response.setTotalProcessed(entries.size());

                int successfulImports = 0;
                int failedImports = 0;

                // Deduplicate entries by email (case-insensitive) within the same
                // CSV so a repeated email doesn't cause a unique-constraint
                // violation. Keep the first occurrence (preserving original order)
                // and record each duplicate as a failure.
                LinkedHashMap<String, CsvWaitlistImportRequest.CsvWaitlistEntry> uniqueEntries = new LinkedHashMap<>();
                for (int idx = 0; idx < entries.size(); idx++) {
                        CsvWaitlistImportRequest.CsvWaitlistEntry entry = entries.get(idx);
                        String key = entry.getEmail() == null ? "" : entry.getEmail().toLowerCase().trim();
                        if (uniqueEntries.containsKey(key)) {
                                response.addFailure(new CsvWaitlistImportResponse.ImportFailure(
                                                idx, entry.getEmail(), "Duplicate email within CSV import"));
                                failedImports++;
                        } else {
                                uniqueEntries.put(key, entry);
                        }
                }

                // Sort unique entries by timestamp to maintain fair queuing (oldest first)
                List<CsvWaitlistImportRequest.CsvWaitlistEntry> sortedEntries = uniqueEntries.values().stream()
                                .sorted(Comparator.comparing(
                                                e -> e.getTimestamp() == null
                                                                ? LocalDateTime.now()
                                                                : parseTimestamp(e.getTimestamp()),
                                                LocalDateTime::compareTo))
                                .toList();
                
                for (int i = 0; i < sortedEntries.size(); i++) {
                        CsvWaitlistImportRequest.CsvWaitlistEntry entry = sortedEntries.get(i);
                        
                        try {
                                // Parse the timestamp
                                LocalDateTime joinedAt = parseTimestamp(entry.getTimestamp());
                                
                                // Find user by email
                                User user = userRepository.findByEmail(entry.getEmail())
                                                .orElse(null);
                                
                                if (user == null) {
                                        // User not found - add to failures
                                        response.addFailure(new CsvWaitlistImportResponse.ImportFailure(
                                                        i, entry.getEmail(), "User with email " + entry.getEmail() + " not found"));
                                        failedImports++;
                                        continue;
                                }
                                
                                // Check if user is already registered for this event
                                if (eventRegistrationRepository.existsByEvent_IdAndUser_Email(eventId, user.getEmail())) {
                                        response.addFailure(new CsvWaitlistImportResponse.ImportFailure(
                                                        i, entry.getEmail(), "User already registered for this event"));
                                        failedImports++;
                                        continue;
                                }
                                
                                // Check if user is already on the waitlist for this event
                                if (eventWaitlistRepository.existsByEvent_IdAndUser_EmailAndStatus(eventId, user.getEmail(), "WAITING")) {
                                        response.addFailure(new CsvWaitlistImportResponse.ImportFailure(
                                                        i, entry.getEmail(), "User already on waitlist for this event"));
                                        failedImports++;
                                        continue;
                                }
                                
                                boolean saved = false;
                                for (int attempt = 1; attempt <= MAX_REGISTRATION_RETRIES; attempt++) {
                                        EventWaitlist waitlistEntry = new EventWaitlist();
                                        waitlistEntry.setEvent(event);
                                        waitlistEntry.setUser(user);
                                        int currentMaxPosition = eventWaitlistRepository.findMaxPositionByEventId(eventId);
                                        waitlistEntry.setPosition(currentMaxPosition + 1);
                                        waitlistEntry.setStatus("WAITING");
                                        waitlistEntry.setJoinedAt(joinedAt);
                                        
                                        try {
                                                eventWaitlistRepository.saveAndFlush(waitlistEntry);
                                                successfulImports++;
                                                saved = true;
                                                break;
                                        } catch (DataIntegrityViolationException ex) {
                                                String details = String.valueOf(ex.getMostSpecificCause() != null
                                                                ? ex.getMostSpecificCause().getMessage()
                                                                : ex.getMessage()).toLowerCase();
                                                if (details.contains("uk_event_waitlist_event_position") || details.contains("position")) {
                                                        continue;
                                                }
                                                if (details.contains("user") || details.contains("event_id")) {
                                                        response.addFailure(new CsvWaitlistImportResponse.ImportFailure(
                                                                        i, entry.getEmail(), "User already on waitlist for this event"));
                                                        failedImports++;
                                                        saved = true;
                                                        break;
                                                }
                                                throw ex;
                                        }
                                }

                                if (!saved) {
                                        response.addFailure(new CsvWaitlistImportResponse.ImportFailure(
                                                        i, entry.getEmail(), "Could not import waitlist entry due to high demand position collisions"));
                                        failedImports++;
                                }
                                
                        } catch (Exception e) {
                                // Handle parsing errors and other exceptions
                                response.addFailure(new CsvWaitlistImportResponse.ImportFailure(
                                                i, entry.getEmail(), "Error processing entry: " + e.getMessage()));
                                failedImports++;
                        }
                }
                
                response.setSuccessfulImports(successfulImports);
                response.setFailedImports(failedImports);
                response.setMessage("Successfully imported " + successfulImports + " of " + entries.size() + " entries");
                
                return response;
        }

        /**
         * Returns a paginated list of event registrants for organizer/admin export.
         *
         * <p>Pages are 1-based to match the frontend export contract
         * ({@code src/Pages/Events/EventDetails.js} uses {@code page} starting at 1).
         */
        @Transactional(readOnly = true)
        public RegistrantsPageResponse getEventRegistrants(Long eventId, String userEmail, int page, int limit) {
                eventRepository.findById(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

                eventRoleService.requireRole(eventId, userEmail, EventRole.ORGANIZER);

                int safePage = Math.max(page, 1);
                int safeLimit = Math.min(Math.max(limit, 1), 1000);
                Pageable pageable = PageRequest.of(safePage - 1, safeLimit);

                Page<EventRegistration> result = eventRegistrationRepository
                                .findByEvent_Id(eventId, pageable);

                return RegistrantsPageResponse.builder()
                                .data(result.getContent().stream()
                                                .map(this::toRegistrantResponse)
                                                .toList())
                                .totalPages(result.getTotalPages())
                                .build();
        }

        @Transactional
        public void leaveWaitlist(Long eventId, String userEmail) {
                EventWaitlist entry = eventWaitlistRepository
                                .findByEvent_IdAndUser_EmailAndStatus(eventId, userEmail, "WAITING")
                                .orElseThrow(() -> new RegistrationConflictException(
                                                "You are not on the waitlist for this event."));

                entry.setStatus("REMOVED");
                eventWaitlistRepository.save(entry);
        }

        @Transactional(readOnly = true)
        public WaitlistResponse getMyWaitlistEntry(Long eventId, String userEmail) {
                eventRepository.findById(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

                EventWaitlist entry = eventWaitlistRepository
                                .findByEvent_IdAndUser_EmailAndStatus(eventId, userEmail, "WAITING")
                                .orElseThrow(() -> new EventNotFoundException(
                                                "You are not on the waitlist for this event."));

                return toWaitlistResponse(entry);
        }

        @Transactional
        public void removeWaitlistEntry(Long eventId, Long waitlistId, String userEmail) {
                eventRepository.findById(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

                eventRoleService.requireRole(eventId, userEmail, EventRole.ORGANIZER);

                EventWaitlist entry = eventWaitlistRepository.findById(waitlistId)
                                .filter(waitlist -> waitlist.getEvent().getId().equals(eventId))
                                .orElseThrow(() -> new EventNotFoundException(
                                                "Waitlist entry not found with id: " + waitlistId));

                if (!"WAITING".equals(entry.getStatus())) {
                        throw new RegistrationConflictException("Waitlist entry is not active.");
                }

                entry.setStatus("REMOVED");
                eventWaitlistRepository.save(entry);
        }

        @Transactional
        public RegistrationResponse promoteWaitlistedUser(Long eventId, Long waitlistId, String userEmail) {
                Event event = eventRepository.findByIdWithLock(eventId)
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

                eventRoleService.requireRole(eventId, userEmail, EventRole.ORGANIZER);

                EventWaitlist entry = eventWaitlistRepository.findById(waitlistId)
                                .filter(waitlist -> waitlist.getEvent().getId().equals(eventId))
                                .orElseThrow(() -> new EventNotFoundException(
                                                "Waitlist entry not found with id: " + waitlistId));

                if (!"WAITING".equals(entry.getStatus())) {
                        throw new RegistrationConflictException("Waitlist entry is not waiting for promotion.");
                }

                if (event.getCapacity() != null && event.getRegisteredCount() >= event.getCapacity()) {
                        throw new EventFullException("Event is already full. Capacity: " + event.getCapacity());
                }

                RegistrationResponse response = promoteEntry(event, entry);
                eventRepository.save(event);
                broadcastAvailability(event);
                return response;
        }

        /**
         * Registers the authenticated user for an event.
         *
         * <p>
         * Business rules enforced:
         * <ol>
         * <li>Event must exist → 404</li>
         * <li>User must exist (resolved from JWT email) → 404</li>
         * <li>User must not already be registered → 409</li>
         * <li>Event must not be at capacity → 409</li>
         * </ol>
         *
         * @param eventId   ID of the event to register for
         * @param userEmail email extracted from JWT principal
         * @return registration confirmation response
         */
        @Transactional
        public RegistrationResponse registerUserForEvent(Long eventId, String userEmail) {
                return registerUserForEvent(eventId, userEmail, null);
        }

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

                for (int attempt = 1; attempt <= MAX_REGISTRATION_RETRIES; attempt++) {
                        try {
                                return executeRegistration(eventId, userEmail, seatId, showProfileInAttendeeDirectory);

                        } catch (ObjectOptimisticLockingFailureException ex) {
                                log.warn(
                                                "Optimistic lock conflict on event {} (attempt {}/{})",
                                                eventId,
                                                attempt,
                                                MAX_REGISTRATION_RETRIES);
                        } catch (org.springframework.dao.PessimisticLockingFailureException ex) {
                                log.warn(
                                                "Pessimistic lock conflict on event {} (attempt {}/{})",
                                                eventId,
                                                attempt,
                                                MAX_REGISTRATION_RETRIES);
                        }
                }

                log.error(
                                "Registration failed after {} retries for event {} by {}",
                                MAX_REGISTRATION_RETRIES,
                                eventId,
                                userEmail);

                throw new RegistrationConflictException(
                                "Registration could not be completed due to high demand. Please try again.");
        }

        private RegistrationResponse executeRegistration(
                        Long eventId,
                        String userEmail,
                        String seatId,
                        boolean showProfileInAttendeeDirectory) {

                Event event = eventRepository.findByIdWithLock(eventId)
                                .orElseThrow(() -> new EventNotFoundException(
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
                                .orElseThrow(() -> new UsernameNotFoundException(
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
                // lock (findByIdWithLock) for the whole transaction, so this
                // in-memory check is safe against concurrent registrations and
                // keeps the increment atomic with the registration save below.
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

                // Increment in memory and persist within the same transaction as
                // the registration so the two either both commit or both roll
                // back (no orphaned capacity increment, #16175).
                event.setRegisteredCount(event.getRegisteredCount() + 1);
                Event saved = eventRepository.save(event);

                broadcastAvailability(saved);

                Integer spotsRemaining = (saved.getCapacity() == null)
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
                                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + eventId));

                User currentUser = userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "User not found with email: " + userEmail));

                boolean isAdmin = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.SUPER_ADMIN;
                boolean isOwner = event.getOwnerId() != null && event.getOwnerId().equals(currentUser.getId());
                boolean isRegistered = eventRegistrationRepository.existsByEvent_IdAndUser_Email(eventId, userEmail);

                if (!isAdmin && !isOwner && !isRegistered) {
                        throw new AccessDeniedException(
                                        "Only registered attendees can view this event's attendee directory.");
                }

                return eventRegistrationRepository
                                .findByEvent_IdAndShowProfileInAttendeeDirectoryTrueOrderByRegisteredAtAsc(eventId)
                                .stream()
                                .map(this::toAttendeeDirectoryResponse)
                                .toList();
        }

        /**
         * Promotes the first waitlisted user when capacity is available.
         * Used after registration cancel and admin user deletion frees seats.
         */
        @Transactional
        public void promoteWaitlistAfterVacancy(Long eventId) {
                Event event = eventRepository.findByIdWithLock(eventId)
                                .orElseThrow(() -> new EventNotFoundException(
                                                "Event not found with id: " + eventId));

                int freeSeats = (event.getCapacity() == null)
                                ? Integer.MAX_VALUE
                                : event.getCapacity() - event.getRegisteredCount();
                int promotionsRemaining = Math.min(freeSeats, MAX_PROMOTIONS_PER_CALL);

                // Query waiting entries ONCE; the event is already pessimistically locked,
                // so no separate per-entry lock is needed inside the loop.
                List<EventWaitlist> waiting = eventWaitlistRepository
                                .findByEvent_IdAndStatusOrderByPositionAscJoinedAtAsc(eventId, "WAITING");

                for (EventWaitlist entry : waiting) {
                        if (promotionsRemaining <= 0) {
                                break;
                        }
                        if (event.getCapacity() != null
                                        && event.getRegisteredCount() >= event.getCapacity()) {
                                break;
                        }
                        if (eventRegistrationRepository.existsByEvent_IdAndUser_Email(
                                        event.getId(), entry.getUser().getEmail())) {
                                entry.setStatus("REMOVED");
                                eventWaitlistRepository.save(entry);
                                continue;
                        }
                        promoteEntry(event, entry);
                        promotionsRemaining--;
                }

                eventRepository.save(event);
                broadcastAvailability(event);
        }

        private void validateLocation(String location) {
                if (location == null || location.trim().length() < 3 || location.trim().length() > 150) {
                        throw new IllegalArgumentException("Location must be between 3 and 150 characters.");
                }
        }

        private RegistrationResponse promoteEntry(Event event, EventWaitlist entry) {
                User user = entry.getUser();

                EventRegistration registration = new EventRegistration();
                registration.setEvent(event);
                registration.setUser(user);
                registration.setRegisteredAt(LocalDateTime.now());
                registration.setStatus("CONFIRMED");
                registration = eventRegistrationRepository.save(registration);

                entry.setStatus("PROMOTED");
                entry.setPromotedAt(LocalDateTime.now());
                eventWaitlistRepository.save(entry);

                notificationRepository.save(Notification.builder()
                                .user(user)
                                .title("Waitlist spot opened")
                                .message("A spot opened for " + event.getTitle()
                                                + ". You have been automatically registered.")
                                .build());

                event.setRegisteredCount(event.getRegisteredCount() + 1);

                Integer spotsRemaining = (event.getCapacity() == null)
                                ? null
                                : Math.max(0, event.getCapacity() - event.getRegisteredCount());

                return RegistrationResponse.builder()
                                .eventId(event.getId())
                                .eventTitle(event.getTitle())
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
                requirePublicEvent(eventId);
                return eventRegistrationRepository.findSeatIdsByEvent_Id(eventId);
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

        /**
         * Broadcasts the latest availability for an event to all connected SSE
         * clients so seat counters update in real-time without a page reload.
         *
         * @param event the event whose availability just changed
         */
        private void broadcastAvailability(Event event) {
                if (event == null) {
                        return;
                }

                EventAvailabilityResponse availability = buildAvailability(event);

                eventStreamService.broadcastAvailability(event.getId(), availability);
        }

        /**
         * Builds the availability payload directly from the event aggregate so the
         * broadcast path does not depend on {@link #requirePublicEvent(Long)}.
         *
         * <p>
         * Cancelling a registration or promoting a waitlist entry for an event that
         * was later made private must still commit the write; the availability
         * broadcast is a side effect and must never throw for non-public events
         * (Issue #14617).
         * </p>
         *
         * @param event the event whose availability just changed (never null)
         * @return availability response (no waitlist position — no user context)
         */
        private EventAvailabilityResponse buildAvailability(Event event) {
                Integer capacity = event.getCapacity();
                int registeredCount = event.getRegisteredCount();

                Integer spotsLeft = (capacity == null)
                                ? null
                                : Math.max(0, capacity - registeredCount);

                boolean isFull = (capacity != null) && (registeredCount >= capacity);

                return EventAvailabilityResponse.builder()
                                .capacity(capacity)
                                .registeredCount(registeredCount)
                                .spotsLeft(spotsLeft)
                                .isFull(isFull)
                                .eventPassed(event.isEventPast())
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
                                .category(event.getCategory())
                                .categories(event.getCategories())
                                .tags(event.getTags())
                                .status(event.getStatus())
                                .cancellationReason(event.getCancellationReason())
                                .cancelledAt(event.getCancelledAt())
                                .refundPolicy(event.getRefundPolicy())
                                .refundPercent(event.getRefundPercent())
                                .build();
        }

        private void validateEventTags(java.util.Set<String> tags) {
                if (tags == null) return;
                for (String tag : tags) {
                        if (tag == null || tag.length() < 2 || tag.length() > 30 || !tag.matches("^[a-zA-Z0-9-]+$")) {
                                throw new IllegalArgumentException("Invalid tag format: " + tag);
                        }
                }
        }

        /**
         * Public catalog responses must not expose organizer user IDs or internal
         * cancellation notes (Issue #13603).
         */
        private EventResponse toPublicEventResponse(Event event) {
                EventResponse response = toEventResponse(event);
                response.setOwnerId(null);
                response.setCancellationReason(null);
                return response;
        }

        private void validateDescription(String desc) {
                if (desc == null || desc.trim().length() < 10 || desc.trim().length() > 2000) {
                        throw new IllegalArgumentException("Description must be between 10 and 2000 characters.");
                }
        }

        private WaitlistResponse toWaitlistResponse(EventWaitlist entry) {
                return WaitlistResponse.builder()
                                .id(entry.getId())
                                .eventId(entry.getEvent().getId())
                                .eventTitle(entry.getEvent().getTitle())
                                .userId(entry.getUser().getId())
                                .userEmail(entry.getUser().getEmail())
                                .position(entry.getPosition())
                                .status(entry.getStatus())
                                .joinedAt(entry.getJoinedAt())
                                .build();
        }

        private EventRegistrantResponse toRegistrantResponse(EventRegistration registration) {
                User user = registration.getUser();
                String displayName = (user.getFirstName() + " " + user.getLastName()).trim();

                return EventRegistrantResponse.builder()
                                .userId(user.getId())
                                .name(displayName.isBlank() ? user.getUsername() : displayName)
                                .email(user.getEmail())
                                .username(user.getUsername())
                                .registeredAt(registration.getRegisteredAt())
                                .status(registration.getStatus())
                                .seatId(registration.getSeatId())
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

        public String buildIcsFeed(Long eventId) {
                Event event = requirePublicEvent(eventId);

                java.time.ZoneId eventZone = resolveEventZone(event.getTimezone());
                java.time.ZonedDateTime start = event.getEventDate() != null
                                ? event.getEventDate().atZone(eventZone)
                                : java.time.ZonedDateTime.now(eventZone);
                // Default duration is 2 hours when no end date was persisted.
                java.time.ZonedDateTime end = (event.getEndDate() != null
                                ? event.getEndDate().atZone(eventZone)
                                : start.plus(java.time.Duration.ofHours(2)));
                java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter
                                .ofPattern("yyyyMMdd'T'HHmmss'Z'")
                                .withZone(java.time.ZoneOffset.UTC);
                java.time.format.DateTimeFormatter zonedFmt = java.time.format.DateTimeFormatter
                                .ofPattern("yyyyMMdd'T'HHmmss");

                String summary = escapeIcs(event.getTitle() != null ? event.getTitle() : "Eventra Event");
                String description = escapeIcs(event.getDescription() != null ? event.getDescription() : "");
                String location = escapeIcs(event.getLocation() != null ? event.getLocation() : "");
                String uid = "event-" + event.getId() + "@eventra";

                return "BEGIN:VCALENDAR\r\n"
                                + "VERSION:2.0\r\n"
                                + "PRODID:-//Eventra//EN\r\n"
                                + "CALSCALE:GREGORIAN\r\n"
                                + "METHOD:PUBLISH\r\n"
                                + "BEGIN:VEVENT\r\n"
                                + "UID:" + uid + "\r\n"
                                + "DTSTAMP:" + fmt.format(java.time.Instant.now()) + "\r\n"
                                + "DTSTART;TZID=" + eventZone.getId() + ":" + zonedFmt.format(start) + "\r\n"
                                + "DTEND;TZID=" + eventZone.getId() + ":" + zonedFmt.format(end) + "\r\n"
                                + "SUMMARY:" + summary + "\r\n"
                                + "DESCRIPTION:" + description + "\r\n"
                                + "LOCATION:" + location + "\r\n"
                                + "END:VEVENT\r\n"
                                + "END:VCALENDAR\r\n";
        }

        private static java.time.ZoneId resolveEventZone(String timezone) {
                if (timezone != null && !timezone.isBlank()) {
                        try {
                                return java.time.ZoneId.of(timezone, java.time.ZoneId.SHORT_IDS);
                        } catch (java.time.DateTimeException ignored) {
                                // fall through to UTC
                        }
                }
                return java.time.ZoneId.of("UTC");
        }

        private static String escapeIcs(String value) {
                return value
                                .replace("\\", "\\\\")
                                .replace(",", "\\,")
                                .replace(";", "\\;")
                                .replace("\n", "\\n")
                                .replace("\r", "");
        }

}
