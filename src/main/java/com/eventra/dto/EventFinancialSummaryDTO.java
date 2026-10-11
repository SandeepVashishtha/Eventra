package com.eventra.dto;

import java.time.LocalDate;

public class EventFinancialSummaryDTO {

    private Long eventId;
    private String eventTitle;
    private int totalRegistrations;
    private double grossRevenue;
    private double refunds;
    private double netRevenue;
    private double estimatedExpenses;
    private double revenuePerParticipant;
    private LocalDate startDateFilter;
    private LocalDate endDateFilter;

    public EventFinancialSummaryDTO() {}

    public EventFinancialSummaryDTO(Long eventId, String eventTitle, int totalRegistrations, double grossRevenue, double refunds, double estimatedExpenses, LocalDate startDateFilter, LocalDate endDateFilter) {
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.totalRegistrations = totalRegistrations;
        this.grossRevenue = grossRevenue;
        this.refunds = refunds;
        this.netRevenue = grossRevenue - refunds;
        this.estimatedExpenses = estimatedExpenses;
        this.revenuePerParticipant = totalRegistrations > 0 ? this.netRevenue / totalRegistrations : 0.0;
        this.startDateFilter = startDateFilter;
        this.endDateFilter = endDateFilter;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public int getTotalRegistrations() { return totalRegistrations; }
    public void setTotalRegistrations(int totalRegistrations) { 
        this.totalRegistrations = totalRegistrations;
        recalculate();
    }

    public double getGrossRevenue() { return grossRevenue; }
    public void setGrossRevenue(double grossRevenue) { 
        this.grossRevenue = grossRevenue;
        recalculate();
    }

    public double getRefunds() { return refunds; }
    public void setRefunds(double refunds) { 
        this.refunds = refunds;
        recalculate();
    }

    public double getNetRevenue() { return netRevenue; }

    public double getEstimatedExpenses() { return estimatedExpenses; }
    public void setEstimatedExpenses(double estimatedExpenses) { this.estimatedExpenses = estimatedExpenses; }

    public double getRevenuePerParticipant() { return revenuePerParticipant; }

    public LocalDate getStartDateFilter() { return startDateFilter; }
    public void setStartDateFilter(LocalDate startDateFilter) { this.startDateFilter = startDateFilter; }

    public LocalDate getEndDateFilter() { return endDateFilter; }
    public void setEndDateFilter(LocalDate endDateFilter) { this.endDateFilter = endDateFilter; }

    private void recalculate() {
        this.netRevenue = this.grossRevenue - this.refunds;
        this.revenuePerParticipant = this.totalRegistrations > 0 ? this.netRevenue / this.totalRegistrations : 0.0;
    }
}
