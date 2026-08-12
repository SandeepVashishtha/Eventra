package com.sandeep.eventrabackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Aggregated summary consumed by the admin analytics dashboard
 * (src/hooks/useAnalytics.js → GET /api/analytics/summary).
 * Carries the full dashboard aggregate plus the live widgets the dashboard
 * renders (category distribution, hours active, security health).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsSummaryDTO {

    private DashboardStatsDTO stats;

    /**
     * Real registration distribution — the top events by confirmed
     * registrations (events do not carry a category dimension yet, so the
     * breakdown is computed from actual attendance data).
     */
    private List<CategoryBreakdownDTO> categoryBreakdown;

    /** Time since the first confirmed registration, e.g. "08h 24m". */
    private String hoursActive;

    /** Null when no check-in data is available yet. */
    private String securityHealth;

    /** Count of flagged/alerts. Zero when no check-in data is available yet. */
    private int activeAlerts;
}
