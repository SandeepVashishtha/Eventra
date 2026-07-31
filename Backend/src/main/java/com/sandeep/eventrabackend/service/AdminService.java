package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.AdminDashboardStatsDTO;
import com.sandeep.eventrabackend.dto.RegistrationTrendDTO;
import com.sandeep.eventrabackend.dto.response.*;
import com.sandeep.eventrabackend.model.Feedback;
import com.sandeep.eventrabackend.model.Hackathon;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    private final UserRepository              userRepository;
    private final EventRepository             eventRepository;
    private final HackathonRepository         hackathonRepository;
    private final FeedbackAnalyticsRepository feedbackRepository;
    private final EventAnalyticsRepository    eventAnalyticsRepo;
    private final RegistrationAnalyticsRepository regRepo;

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
    public PagedResponse<AdminUserResponse> getUsers(int page, int size, String role) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage;

        if (role != null && !role.isBlank()) {
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
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        user.setRole(parseRole(newRole));
        return toAdminUserResponse(userRepository.save(user));
    }

    /**
     * Deletes a user by ID.
     */
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new EntityNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 2. EVENT MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Returns all events (paginated), visible to admin regardless of isPublic.
     */
    public PagedResponse<EventResponse> getEvents(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("eventDate").descending());
        return PagedResponse.from(eventRepository.findAll(pageable).map(this::toEventResponse));
    }

    /**
     * Returns all attendees registered for a specific event.
     */
    public List<AdminUserResponse> getEventAttendees(Long eventId) {
        var event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with id: " + eventId));
        return event.getAttendees().stream()
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
    }

    /**
     * Force-deletes an event (admin override, bypasses organizer ownership).
     */
    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 3. HACKATHON MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Returns all hackathons (paginated).
     */
    public PagedResponse<HackathonResponse> getHackathons(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("startDate").descending());
        return PagedResponse.from(hackathonRepository.findAll(pageable).map(this::toHackathonResponse));
    }

    /**
     * Deletes a hackathon by ID.
     */
    @Transactional
    public void deleteHackathon(Long id) {
        if (!hackathonRepository.existsById(id)) {
            throw new EntityNotFoundException("Hackathon not found with id: " + id);
        }
        hackathonRepository.deleteById(id);
    }

    // ══════════════════════════════════════════════════════════════════════
    // 4. ANALYTICS
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Returns an extended admin dashboard with user, event, hackathon, and feedback stats.
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
                .totalClients(userRepository.countByRole(Role.CLIENT))
                // Events
                .totalEvents(eventAnalyticsRepo.count())
                .activeEvents(eventAnalyticsRepo.countActiveEvents(now))
                .completedEvents(eventAnalyticsRepo.countCompletedEvents(now))
                // Registrations
                .totalRegistrations(regRepo.countConfirmedRegistrations())
                .uniqueParticipants(eventAnalyticsRepo.countUniqueParticipants())
                .averageCapacityUtilization(
                        Optional.ofNullable(eventAnalyticsRepo.findAverageCapacityUtilization()).orElse(0.0))
                // Hackathons
                .totalHackathons(hackathonRepository.count())
                // Feedback
                .totalFeedbackSubmissions(feedbackRepository.countTotalFeedback())
                .overallAverageRating(
                        Optional.ofNullable(feedbackRepository.findOverallAverageRating()).orElse(0.0))
                .build();
    }

    /**
     * Returns user registration growth trend (monthly by default).
     */
    public List<RegistrationTrendDTO> getUserGrowthTrend(int months) {
        // Reuse existing registration trend from AnalyticsService logic
        LocalDateTime from = LocalDateTime.now().minusMonths(months);
        List<Object[]> raw = regRepo.findMonthlyTrend(from);

        final long[] cumulative = {0};
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
        return eventAnalyticsRepo.findMostPopularEvents(PageRequest.of(0, limit))
                .stream()
                .map(row -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("eventId",       ((Number) row[0]).longValue());
                    m.put("eventTitle",    row[1].toString());
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
        Pageable pageable = PageRequest.of(page, size, Sort.by("submittedAt").descending());
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
                    ". Must be one of: CLIENT, ORGANIZER, ADMIN, SUPER_ADMIN");
        }
    }
}
