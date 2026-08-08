package com.sandeep.eventrabackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDTO {

    // ── Users ──────────────────────────────────────────────────────────────
    private long totalUsers;
    private long newUsersThisMonth;
    private long totalAdmins;
    private long totalOrganizers;
    private long totalClients;

    // ── Events ─────────────────────────────────────────────────────────────
    private long totalEvents;
    private long activeEvents;
    private long completedEvents;

    // ── Registrations ──────────────────────────────────────────────────────
    private long totalRegistrations;
    private long uniqueParticipants;
    private double averageCapacityUtilization;

    // ── Hackathons ─────────────────────────────────────────────────────────
    private long totalHackathons;

    // ── Feedback ───────────────────────────────────────────────────────────
    private long totalFeedbackSubmissions;
    private double overallAverageRating;
}
