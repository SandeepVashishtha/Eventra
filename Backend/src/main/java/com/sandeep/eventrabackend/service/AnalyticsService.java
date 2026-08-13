package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.DashboardStatsDTO;
import com.sandeep.eventrabackend.dto.CategoryBreakdownDTO;
import com.sandeep.eventrabackend.dto.FeedbackAnalyticsDTO;
import com.sandeep.eventrabackend.dto.OrganizerInsightDTO;
import com.sandeep.eventrabackend.dto.RegistrationTrendDTO;
import com.sandeep.eventrabackend.dto.AnalyticsSummaryDTO;
import com.sandeep.eventrabackend.model.Event;
import com.sandeep.eventrabackend.model.Role;
import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.EventAnalyticsRepository;
import com.sandeep.eventrabackend.repository.FeedbackAnalyticsRepository;
import com.sandeep.eventrabackend.repository.RegistrationAnalyticsRepository;
import com.sandeep.eventrabackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final String[] BREAKDOWN_COLORS = {
            "#6366f1", "#ec4899", "#10b981", "#f59e0b", "#06b6d4"
    };

    private final EventAnalyticsRepository eventRepo;
    private final RegistrationAnalyticsRepository regRepo;
    private final FeedbackAnalyticsRepository feedbackRepo;
    private final UserRepository userRepository;

    // ── 0. Summary (admin dashboard) ────────────────────────────────────────
    public AnalyticsSummaryDTO getSummary() {
        return getSummary(resolveEventScope());
    }

    private AnalyticsSummaryDTO getSummary(List<Long> eventIds) {
        List<Object[]> rows = eventRepo.findCategoryBreakdown(
                eventIds, PageRequest.of(0, BREAKDOWN_COLORS.length));

        List<CategoryBreakdownDTO> breakdown = new ArrayList<>(rows.size());
        for (int i = 0; i < rows.size(); i++) {
            Object[] row = rows.get(i);
            breakdown.add(CategoryBreakdownDTO.builder()
                    .name(row[0].toString())
                    .value(((Number) row[1]).longValue())
                    .color(BREAKDOWN_COLORS[i % BREAKDOWN_COLORS.length])
                    .build());
        }

        return AnalyticsSummaryDTO.builder()
                .stats(getDashboardStats(eventIds))
                .categoryBreakdown(breakdown)
                .hoursActive(computeHoursActive(eventIds))
                .securityHealth(null)
                .activeAlerts(0)
                .build();
    }

    private String computeHoursActive(List<Long> eventIds) {
        LocalDateTime first = regRepo.findEarliestRegistration(eventIds);
        if (first == null) {
            return "0h 0m";
        }
        long minutes = Duration.between(first, LocalDateTime.now()).toMinutes();
        return (minutes / 60) + "h " + (minutes % 60) + "m";
    }

    // ── 1. Dashboard ──────────────────────────────────────────────────────────
    public DashboardStatsDTO getDashboardStats() {
        return getDashboardStats(resolveEventScope());
    }

    private DashboardStatsDTO getDashboardStats(List<Long> eventIds) {
        LocalDateTime now = LocalDateTime.now();
        return DashboardStatsDTO.builder()
            .totalEvents(eventRepo.countEvents(eventIds))
            .totalRegistrations(regRepo.countConfirmedRegistrations(eventIds))
            .activeEvents(eventRepo.countActiveEvents(now, eventIds))
            .completedEvents(eventRepo.countCompletedEvents(now, eventIds))
            .uniqueParticipants(eventRepo.countUniqueParticipants(eventIds))
            .averageCapacityUtilization(
                Optional.ofNullable(eventRepo.findAverageCapacityUtilization(eventIds)).orElse(0.0))
            .totalFeedbackSubmissions(feedbackRepo.countTotalFeedback(eventIds))
            .overallAverageRating(
                Optional.ofNullable(feedbackRepo.findOverallAverageRating(eventIds)).orElse(0.0))
            .build();
    }

    // ── 2. Registration trends ────────────────────────────────────────────────
    public List<RegistrationTrendDTO> getRegistrationTrend(String granularity, int periods) {
        return getRegistrationTrend(granularity, periods, resolveEventScope());
    }

    private List<RegistrationTrendDTO> getRegistrationTrend(String granularity, int periods, List<Long> eventIds) {
        int safePeriods = Math.max(1, Math.min(periods, 365));
        LocalDateTime from = switch (granularity.toLowerCase()) {
            case "daily"  -> LocalDateTime.now().minusDays(safePeriods);
            case "weekly" -> LocalDateTime.now().minusWeeks(safePeriods);
            default       -> LocalDateTime.now().minusMonths(safePeriods);
        };

        List<Object[]> raw = switch (granularity.toLowerCase()) {
            case "daily"  -> regRepo.findDailyTrend(from, eventIds);
            case "weekly" -> regRepo.findWeeklyTrend(from, eventIds);
            default       -> regRepo.findMonthlyTrend(from, eventIds);
        };

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

    // ── 3. Most popular events ────────────────────────────────────────────────
    public List<Map<String, Object>> getMostPopularEvents(int limit) {
        return eventRepo.findMostPopularEvents(resolveEventScope(), PageRequest.of(0, limit))
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

    // ── 4. Feedback analytics ─────────────────────────────────────────────────
    public List<FeedbackAnalyticsDTO> getFeedbackAnalytics() {
        return getFeedbackAnalytics(resolveEventScope());
    }

    private List<FeedbackAnalyticsDTO> getFeedbackAnalytics(List<Long> eventIds) {
        return feedbackRepo.findPerEventSummary(eventIds).stream().map(row -> {
            Long   eventId = ((Number) row[0]).longValue();
            double avg     = ((Number) row[2]).doubleValue();
            long   count   = ((Number) row[3]).longValue();

            Map<Integer, Long> dist = feedbackRepo
                .findRatingDistributionByEvent(eventId)
                .stream()
                .collect(Collectors.toMap(
                    r -> ((Number) r[0]).intValue(),
                    r -> ((Number) r[1]).longValue()
                ));

            long satisfied = dist.entrySet().stream()
                .filter(e -> e.getKey() >= 4)
                .mapToLong(Map.Entry::getValue)
                .sum();

            return FeedbackAnalyticsDTO.builder()
                .eventId(eventId)
                .eventName(row[1].toString())
                .averageRating(avg)
                .feedbackCount(count)
                .ratingDistribution(dist)
                .satisfactionScore(count > 0 ? (satisfied * 100.0 / count) : 0.0)
                .build();
        }).collect(Collectors.toList());
    }

    // ── 5. Peak registration periods ─────────────────────────────────────────
    public List<Map<String, Object>> getPeakPeriods() {
        String[] days = {"", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
        return regRepo.findPeakPeriods(resolveEventScope()).stream()
            .limit(10)
            .map(row -> {
                Map<String, Object> m = new LinkedHashMap<>();
                int dow = ((Number) row[0]).intValue();
                int hr  = ((Number) row[1]).intValue();
                m.put("dayOfWeek",  days[dow]);
                m.put("hour",       String.format("%02d:00", hr));
                m.put("count",      ((Number) row[2]).longValue());
                return m;
            })
            .collect(Collectors.toList());
    }

    // ── 6. Organizer insights ────────────────────────────────────────────────
    /**
     * Returns analytics scoped to the events the caller owns or manages.
     * ADMIN / SUPER_ADMIN receive the full per-organizer breakdown; a
     * regular ORGANIZER only sees their own events (ownerId or event team).
     */
    public List<OrganizerInsightDTO> getOrganizerInsights() {
        User caller = currentUser();

        if (caller.getRole() == Role.ADMIN || caller.getRole() == Role.SUPER_ADMIN) {
            return eventRepo.findDistinctOwnerIds().stream()
                    .map(ownerId -> userRepository.findById(ownerId)
                            .map(owner -> buildOrganizerInsight(
                                    owner.getId(),
                                    owner.getFirstName(),
                                    owner.getLastName(),
                                    eventRepo.findAccessibleToUser(owner.getId())))
                            .orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        }

        return List.of(buildOrganizerInsight(
                caller.getId(),
                caller.getFirstName(),
                caller.getLastName(),
                eventRepo.findAccessibleToUser(caller.getId())));
    }

    /**
     * Resolve the event scope for the caller: {@code null} (global) for
     * ADMIN / SUPER_ADMIN, or the list of events the caller owns/manages
     * for a regular ORGANIZER. This enforces tenant isolation on the
     * dashboard/summary/trends/feedback analytics.
     */
    private List<Long> resolveEventScope() {
        User caller = currentUser();
        if (caller.getRole() == Role.ADMIN || caller.getRole() == Role.SUPER_ADMIN) {
            return null;
        }
        return eventRepo.findAccessibleToUser(caller.getId()).stream()
                .map(Event::getId)
                .collect(Collectors.toList());
    }

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Unable to determine the authenticated user");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found with email: " + authentication.getName()));
    }

    private OrganizerInsightDTO buildOrganizerInsight(
            Long organizerId,
            String firstName,
            String lastName,
            List<Event> events) {

        List<Long> eventIds = events.stream()
                .map(Event::getId)
                .collect(Collectors.toList());

        Double avgRating = eventIds.isEmpty()
                ? null
                : feedbackRepo.findAverageRatingForEvents(eventIds);

        double avgCapacityUtilization = events.stream()
                .filter(e -> e.getCapacity() != null && e.getCapacity() > 0)
                .mapToDouble(e -> (double) e.getRegisteredCount() / e.getCapacity())
                .average()
                .orElse(0.0);

        return OrganizerInsightDTO.builder()
                .organizerId(organizerId)
                .organizerName(firstName + " " + lastName)
                .totalEvents(events.size())
                .totalRegistrations(events.stream()
                        .mapToLong(Event::getRegisteredCount)
                        .sum())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .avgCapacityUtilization(avgCapacityUtilization)
                .build();
    }
}

