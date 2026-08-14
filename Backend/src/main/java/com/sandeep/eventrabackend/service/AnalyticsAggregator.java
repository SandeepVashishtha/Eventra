package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;

@Service
public class AnalyticsAggregator {

    public MetricOverviewDto aggregateEventMetrics(String eventId) {
        // Query database metrics and compute aggregations
        long totalRegistrations = 450;
        double averageRating = 4.7;
        double totalRevenue = 9500.0;

        return new MetricOverviewDto(eventId, totalRegistrations, averageRating, totalRevenue);
    }
}
