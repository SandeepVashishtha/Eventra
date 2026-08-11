package com.sandeep.eventrabackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Compact dashboard stats consumed by the admin panel home page.
 *
 * <p>Shape matches what {@code AdminDashboard.js} renders:
 * {@code totalUsers}, {@code activeUsers}, {@code totalEvents},
 * {@code upcoming} and {@code totalParticipants}.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    /** Total number of registered user accounts. */
    private long totalUsers;

    /** Distinct users with at least one confirmed event registration. */
    private long activeUsers;

    /** Total number of events. */
    private long totalEvents;

    /** Number of events scheduled in the future. */
    private long upcoming;

    /** Total confirmed registrations across all events. */
    private long totalParticipants;
}
