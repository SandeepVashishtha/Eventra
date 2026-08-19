package com.sandeep.eventrabackend.service;

public class MetricOverviewDto {
    private final String eventId;
    private final long totalRegistrations;
    private final double averageRating;
    private final double totalRevenue;

    public MetricOverviewDto(String eventId, long totalRegistrations, double averageRating, double totalRevenue) {
        this.eventId = eventId;
        this.totalRegistrations = totalRegistrations;
        this.averageRating = averageRating;
        this.totalRevenue = totalRevenue;
    }

    public String getEventId() {
        return eventId;
    }

    public long getTotalRegistrations() {
        return totalRegistrations;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }
}
