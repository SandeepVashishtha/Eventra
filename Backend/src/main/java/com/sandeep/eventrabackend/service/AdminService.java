package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.AdminDashboardStatsDTO;
import com.sandeep.eventrabackend.dto.AdminStatsResponse;
import com.sandeep.eventrabackend.dto.RegistrationTrendDTO;
import com.sandeep.eventrabackend.dto.response.*;
import com.sandeep.eventrabackend.exception.RegistrationConflictException;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Feedback;
import com.sandeep.eventrabackend.model.Hackathon;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Central service for all Admin Panel operations.
 * All public methods are intended to be called from AdminController,
 * which enforces ADMIN / SUPER_ADMIN role checks via @PreAuthorize.
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final HackathonRepository hackathonRepository;
    private final FeedbackAnalyticsRepository feedbackRepository;
    private final EventAnalyticsRepository eventAnalyticsRepo;
    private final RegistrationAnalyticsRepository regRepo;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventWaitlistRepository eventWaitlistRepository;
    private final EventTeamMemberRepository eventTeamMemberRepository;
    private final EventRoleAuditLogRepository eventRoleAuditLogRepository;
    private final HackathonRegistrationRepository hackathonRegistrationRepository;
    private final ProjectUpvoteRepository projectUpvoteRepository;
    private final NotificationRepository notificationRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentPlanRepository paymentPlanRepository;
    private final EmailTemplateRepository emailTemplateRepository;
    private final EventService eventService;

    // ══════════════════════════════════════════════════════════════════════
    // 1. USER MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Returns all users, optionally filtered by role.
     *
     * @param page page index (0-based)
     * @param size page size
     * @param role optional role filter (e.g. "CLIENT") — null means all users
     */
    public PagedResponse<AdminUserResponse> getUsers(int page, int size, String role, String search) {
        int safePage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(safePage, size, Sort.by("createdAt").descending());
        Page<User> userPage;
        boolean hasSearch = StringUtils.hasText(search);
        String trimmedSearch = hasSearch ? search.trim() : null;

        if (hasSearch && role != null && !role.isBlank()) {
            Role roleEnum = parseRole(role);
            userPage = userRepository.searchUsersByRole(roleEnum, trimmedSearch, pageable);
        } else if (hasSearch) {
            userPage = userRepository.searchUsers(trimmedSearch, pageable);
        } else if (role != null && !role.isBlank()) {
            Role roleEnum = parseRole(role);
            userPage = userRepository.findByRole(roleEnum, pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        return PagedResponse.from(userPage.map(this::toAdminUserResponse));
    }

    /**
     * Returns a single user by ID.
     */
    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        return toAdminUserResponse(user);
    }

    /**
     * Updates the role of a user.
     */
    @Transactional
    public AdminUserResponse updateUserRole(Long id, String newRole) {
        Role requestedRole = parseRole(newRole);
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        Role callerRole = getAuthenticatedRole();
        assertCanModifyTarget(callerRole, targetUser);
        assertCanAssignRole(callerRole, requestedRole);

        targetUser.setRole(requestedRole);
        return toAdminUserResponse(userRepository.save(targetUser));
    }

    @Transactional
    public AdminUserResponse updateUser(Long id, com.sandeep.eventrabackend.dto.request.AdminUpdateUserRequest request) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        Role callerRole = getAuthenticatedRole();
        assertCanModifyTarget(callerRole, targetUser);

        if (request.getFirstName() != null) {
            targetUser.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            targetUser.setLastName(request.getLastName().trim());
        }
        if (request.getUsername() != null) {
            String username = request.getUsername().trim();
            if (!username.equalsIgnoreCase(targetUser.getUsername()) && userRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("Username is already taken");
            }
            targetUser.setUsername(username);
        }
        if (request.getEmail() != null) {
            String requestedEmail = request.getEmail().trim().toLowerCase();
            if (!targetUser.getEmail().equalsIgnoreCase(requestedEmail)) {
                throw new IllegalArgumentException(
                        "Email changes are not allowed through the admin panel. "
                                + "Changing an email would orphan the user's active JWT session and email-keyed data. "
                                + "Email must be changed through a dedicated, verified self-service flow.");
            }
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            Role requestedRole = parseRole(request.getRole());
            assertCanAssignRole(callerRole, requestedRole);
            targetUser.setRole(requestedRole);
        }

        return toAdminUserResponse(userRepository.save(targetUser));
    }

    /**
     * Deletes a user by ID.
     */
    @Transactional
    public void deleteUser(Long id) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && targetUser.getEmail().equalsIgnoreCase(auth.getName())) {
            throw new IllegalArgumentException("Administrators cannot delete their own active account.");
        }

        Role callerRole = getAuthenticatedRole();
        assertCanModifyTarget(callerRole, targetUser);

        List<Long> affectedEventIds = eventRegistrationRepository.findEventIdsByUser_Id(id);

        // Clear owner references before deletion to prevent foreign key constraint violations
        eventRepository.clearOwnerByUserId(id);
        hackathonRepository.clearOwnerByUserId(id);

        eventRegistrationRepository.deleteByUser_Id(id);
        eventWaitlistRepository.deleteByUser_Id(id);
        hackathonRegistrationRepository.deleteByUser_Id(id);
        projectUpvoteRepository.deleteByUser_Id(id);
        notificationRepository.deleteByUser_Id(id);
        feedbackRepository.deleteByUser_Id(id);
        // eventRepository.deleteAttendeeRowsByUserId(id); // Removed dropped table call
        eventTeamMemberRepository.clearAssignedByUserId(id);
        eventTeamMemberRepository.deleteByUser_Id(id);

        for (Long eventId : affectedEventIds) {
            eventRepository.findById(eventId).ifPresent(event -> {
                event.setRegisteredCount((int) eventRegistrationRepository
                        .countByEvent_IdAndStatus(eventId, "CONFIRMED"));
                eventRepository.save(event);
            });
            eventService.promoteWaitlistAfterVacancy(eventId);
        }

        userRepository.deleteById(id);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 2. EVENT MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Returns all events (paginated), visible to admin regardless of isPublic.
     */
    public PagedResponse<EventResponse> getEvents(int page, int size, String search) {
        int safePage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(safePage, size, Sort.by("eventDate").descending());
        Specification<com.sandeep.eventrabackend.model.Event> spec = EventSpecifications.searchContains(search);
        Page<com.sandeep.eventrabackend.model.Event> eventPage = spec == null
                ? eventRepository.findAll(pageable)
                : eventRepository.findAll(spec, pageable);
        return PagedResponse.from(eventPage.map(this::toEventResponse));
    }

    /**
     * Returns all attendees registered for a specific event.
     */
    public List<AdminUserResponse> getEventAttendees(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new EntityNotFoundException("Event not found with id: " + eventId);
        }
        return eventRegistrationRepository.findByEvent_Id(eventId).stream()
                .filter(registration -> "CONFIRMED".equals(registration.getStatus()))
                .map(registration -> toAdminUserResponse(registration.getUser()))
                .collect(Collectors.toList());
    }

    /**
     * Force-deletes an event (admin override, bypasses organizer ownership).
     * Dependent rows are removed first so the delete never hits a foreign-key
     * violation and no orphaned rows are left behind (Issue #12082).
     */
    @Transactional
    public EventResponse updateEvent(Long id, com.sandeep.eventrabackend.dto.request.EventUpdateRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + id));

        Integer previousCapacity = event.getCapacity();

        if (request.getCapacity() != null && request.getCapacity() < event.getRegisteredCount()) {
            throw new RegistrationConflictException(
                    "Capacity cannot be reduced below the current number of registered users ("
                            + event.getRegisteredCount() + ")");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        if (request.getCapacity() != null) {
            event.setCapacity(request.getCapacity());
        }
        if (request.getIsPublic() != null) {
            event.setPublic(request.getIsPublic());
        }
        if (request.getImageUrl() != null) {
            event.setImageUrl(request.getImageUrl());
        }
        if (request.getCategory() != null) {
            event.setCategory(request.getCategory());
        }
        if (request.getTags() != null) {
            event.setTags(request.getTags());
        }

        Event saved = eventRepository.save(event);

        if (request.getCapacity() != null && previousCapacity != null
                && request.getCapacity() > previousCapacity) {
            eventService.promoteWaitlistAfterVacancy(id);
        }

        return toEventResponse(saved);
    }

    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Event not found with id: " + id);
        }
        paymentRepository.deleteByRegistration_Event_Id(id);
        paymentPlanRepository.deleteByRegistration_Event_Id(id);
        emailTemplateRepository.deleteByEventId(String.valueOf(id));
        eventRegistrationRepository.deleteByEventId(id);
        eventWaitlistRepository.deleteByEvent_Id(id);
        eventTeamMemberRepository.deleteByEvent_Id(id);
        feedbackRepository.deleteByEvent_Id(id);
        eventRoleAuditLogRepository.deleteByEventId(id);
        eventRepository.deleteById(id);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 3. HACKATHON MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Returns all hackathons (paginated).
     */
    public PagedResponse<HackathonResponse> getHackathons(int page, int size) {
        int safePage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(safePage, size, Sort.by("startDate").descending());
        return PagedResponse.from(hackathonRepository.findByIsDeletedFalse(pageable).map(this::toHackathonResponse));
    }

    /**
     * Deletes a hackathon by ID.
     */
    @Transactional
    public void deleteHackathon(Long id) {
        if (!hackathonRepository.existsById(id)) {
            throw new EntityNotFoundException("Hackathon not found with id: " + id);
        }
        hackathonRegistrationRepository.deleteByHackathonId(id);
        hackathonRepository.deleteById(id);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4. ANALYTICS
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Returns an extended admin dashboard with user, event, hackathon, and feedback
     * stats.
     */
    public AdminDashboardStatsDTO getAdminDashboard() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        return AdminDashboardStatsDTO.builder()
                // Users
                .totalUsers(userRepository.count())
                .newUsersThisMonth(userRepository.countByCreatedAtAfter(startOfMonth))
                .totalAdmins(userRepository.countByRole(Role.ADMIN))
                .totalOrganizers(userRepository.countByRole(Role.ORGANIZER))
                .totalAttendees(userRepository.countByRole(Role.ATTENDEE)
                        + userRepository.countByRole(Role.CLIENT))
                .totalClients(userRepository.countByRole(Role.CLIENT))
                // Events
                .totalEvents(eventAnalyticsRepo.count())
                .activeEvents(eventAnalyticsRepo.countActiveEvents(now, null))
                .completedEvents(eventAnalyticsRepo.countCompletedEvents(now, null))
                // Registrations
                .totalRegistrations(regRepo.countConfirmedRegistrations(null))
                .uniqueParticipants(eventAnalyticsRepo.countUniqueParticipants(null))
                .averageCapacityUtilization(
                        Optional.ofNullable(eventAnalyticsRepo.findAverageCapacityUtilization(null)).orElse(0.0))
                // Hackathons
                .totalHackathons(hackathonRepository.countByIsDeletedFalse())
                // Feedback
                .totalFeedbackSubmissions(feedbackRepository.countTotalFeedback(null))
                .overallAverageRating(
                        Optional.ofNullable(feedbackRepository.findOverallAverageRating(null)).orElse(0.0))
                .build();
    }

    /**
     * Returns the compact dashboard stats consumed by the admin home page.
     *
     * <p>Mirrors {@code GET /api/admin/stats}: total users, active (participating)
     * users, total and upcoming events, and total confirmed registrations.
     */
    public AdminStatsResponse getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .activeUsers(eventAnalyticsRepo.countUniqueParticipants(null))
                .totalEvents(eventAnalyticsRepo.count())
                .upcoming(eventAnalyticsRepo.countActiveEvents(now, null))
                .totalParticipants(regRepo.countConfirmedRegistrations(null))
                .build();
    }

    /**
     * Returns user growth trend (monthly new signups by default).
     * Counts newly created {@link User} accounts grouped by the month of
     * their {@code createdAt}, not event registrations (Issue #11232).
     */
    public List<RegistrationTrendDTO> getUserGrowthTrend(int months) {
        int safeMonths = Math.max(1, Math.min(months, 24));
        LocalDateTime from = LocalDateTime.now().minusMonths(safeMonths);
        List<Object[]> raw = userRepository.findMonthlySignupTrend(from);

        final long[] cumulative = { 0 };
        return raw.stream().map(row -> {
            long count = ((Number) row[1]).longValue();
            cumulative[0] += count;
            return RegistrationTrendDTO.builder()
                    .period(row[0].toString())
                    .registrationCount(count)
                    .cumulativeTotal(cumulative[0])
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Returns the top N most popular events ordered by registration count.
     */
    public List<Map<String, Object>> getPopularEvents(int limit) {
        return eventAnalyticsRepo.findMostPopularEvents(null, PageRequest.of(0, limit))
                .stream()
                .map(row -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("eventId", ((Number) row[0]).longValue());
                    m.put("eventTitle", row[1].toString());
                    m.put("registrations", ((Number) row[2]).longValue());
                    m.put("capacity",
                            row[3] != null ? ((Number) row[3]).intValue() : "Unlimited");
                    m.put("utilization",
                            row[4] != null
                                    ? String.format("%.1f%%", ((Number) row[4]).doubleValue() * 100)
                                    : "N/A");
                    return m;
                })
                .collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════════════════
    // 5. FEEDBACK MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Returns all feedback entries (paginated).
     */
    public PagedResponse<AdminFeedbackResponse> getAllFeedback(int page, int size) {
        int safePage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(safePage, size, Sort.by("submittedAt").descending());
        return PagedResponse.from(feedbackRepository.findAll(pageable).map(this::toAdminFeedbackResponse));
    }

    /**
     * Deletes a feedback entry by ID.
     */
    @Transactional
    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new EntityNotFoundException("Feedback not found with id: " + id);
        }
        feedbackRepository.deleteById(id);
    }

    // ══════════════════════════════════════════════════════════════════════
    // Private helpers
    // ══════════════════════════════════════════════════════════════════════

    private AdminUserResponse toAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private EventResponse toEventResponse(com.sandeep.eventrabackend.model.Event event) {
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

    private HackathonResponse toHackathonResponse(Hackathon h) {
        return HackathonResponse.builder()
                .id(h.getId())
                .title(h.getTitle())
                .description(h.getDescription())
                .organizer(h.getOrganizer())
                .startDate(h.getStartDate())
                .endDate(h.getEndDate())
                .location(h.getLocation())
                .mode(h.getMode())
                .prizePool(h.getPrizePool())
                .registrationDeadline(h.getRegistrationDeadline())
                .imageUrl(h.getImageUrl())
                .build();
    }

    private AdminFeedbackResponse toAdminFeedbackResponse(Feedback f) {
        return AdminFeedbackResponse.builder()
                .id(f.getId())
                .eventId(f.getEvent() != null ? f.getEvent().getId() : null)
                .eventTitle(f.getEvent() != null ? f.getEvent().getTitle() : null)
                .userId(f.getUser() != null ? f.getUser().getId() : null)
                .username(f.getUser() != null ? f.getUser().getUsername() : null)
                .rating(f.getRating())
                .comment(f.getComment())
                .submittedAt(f.getSubmittedAt())
                .build();
    }

    private Role parseRole(String role) {
        try {
            return Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role +
                    ". Must be one of: CLIENT, ATTENDEE, MODERATOR, OWNER, ORGANIZER, ADMIN, SUPER_ADMIN");
        }
    }

    private Role getAuthenticatedRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities().isEmpty()) {
            throw new AccessDeniedException("Unable to determine the authenticated user's role");
        }
        return Role.valueOf(authentication.getAuthorities().iterator().next().getAuthority());
    }

    /**
     * Non–SUPER_ADMIN callers may not modify ADMIN or SUPER_ADMIN accounts
     * (email/role/delete would otherwise enable peer admin takeover).
     */
    private void assertCanModifyTarget(Role callerRole, User targetUser) {
        if (callerRole == Role.SUPER_ADMIN) {
            return;
        }
        Role targetRole = targetUser.getRole();
        if (targetRole == Role.SUPER_ADMIN) {
            throw new AccessDeniedException("Only SUPER_ADMIN users can modify SUPER_ADMIN accounts");
        }
        if (targetRole == Role.ADMIN) {
            throw new AccessDeniedException("Only SUPER_ADMIN users can modify ADMIN accounts");
        }
    }

    private void assertCanAssignRole(Role callerRole, Role requestedRole) {
        if (callerRole == Role.SUPER_ADMIN) {
            return;
        }
        if (requestedRole == Role.SUPER_ADMIN || requestedRole == Role.ADMIN) {
            throw new AccessDeniedException("Only SUPER_ADMIN users can assign ADMIN or SUPER_ADMIN roles");
        }
    }
}
