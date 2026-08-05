package com.sandeep.eventrabackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    // Event counts
    private long totalEvents;
    private long activeEvents;        // eventDate > now
    private long completedEvents;     // eventDate <= now

    // Registration counts (CONFIRMED only)
    private long totalRegistrations;
    private long uniqueParticipants;  // distinct users across event_attendees

    // Capacity
    private double averageCapacityUtilization; // 0.0–1.0, null-safe

    // Feedback
    private long   totalFeedbackSubmissions;
    private double overallAverageRating;       // 1.0–5.0, 0.0 if no feedback yet
}
