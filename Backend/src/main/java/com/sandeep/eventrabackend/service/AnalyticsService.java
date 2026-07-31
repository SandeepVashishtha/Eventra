package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.DashboardStatsDTO;
import com.sandeep.eventrabackend.dto.FeedbackAnalyticsDTO;
import com.sandeep.eventrabackend.dto.OrganizerInsightDTO;
import com.sandeep.eventrabackend.dto.RegistrationTrendDTO;
import com.sandeep.eventrabackend.repository.EventAnalyticsRepository;
import com.sandeep.eventrabackend.repository.FeedbackAnalyticsRepository;
import com.sandeep.eventrabackend.repository.RegistrationAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EventAnalyticsRepository eventRepo;
    private final RegistrationAnalyticsRepository regRepo;
    private final FeedbackAnalyticsRepository feedbackRepo;

    // ── 1. Dashboard ──────────────────────────────────────────────────────────
    public DashboardStatsDTO getDashboardStats() {
        LocalDateTime now = LocalDateTime.now();
        return DashboardStatsDTO.builder()
            .totalEvents(eventRepo.count())
            .totalRegistrations(regRepo.countConfirmedRegistrations())
            .activeEvents(eventRepo.countActiveEvents(now))
            .completedEvents(eventRepo.countCompletedEvents(now))
            .uniqueParticipants(eventRepo.countUniqueParticipants())
            .averageCapacityUtilization(
                Optional.ofNullable(eventRepo.findAverageCapacityUtilization()).orElse(0.0))
            .totalFeedbackSubmissions(feedbackRepo.countTotalFeedback())
            .overallAverageRating(
                Optional.ofNullable(feedbackRepo.findOverallAverageRating()).orElse(0.0))
            .build();
    }

    // ── 2. Registration trends ────────────────────────────────────────────────
    public List<RegistrationTrendDTO> getRegistrationTrend(String granularity, int periods) {
        LocalDateTime from = switch (granularity.toLowerCase()) {
            case "daily"  -> LocalDateTime.now().minusDays(periods);
            case "weekly" -> LocalDateTime.now().minusWeeks(periods);
            default       -> LocalDateTime.now().minusMonths(periods);
        };

        List<Object[]> raw = switch (granularity.toLowerCase()) {
            case "daily"  -> regRepo.findDailyTrend(from);
            case "weekly" -> regRepo.findWeeklyTrend(from);
            default       -> regRepo.findMonthlyTrend(from);
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
        return eventRepo.findMostPopularEvents(PageRequest.of(0, limit))
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
        return feedbackRepo.findPerEventSummary().stream().map(row -> {
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
        return regRepo.findPeakPeriods().stream()
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
    public List<OrganizerInsightDTO> getOrganizerInsights() {
        return List.of();
    }
}

