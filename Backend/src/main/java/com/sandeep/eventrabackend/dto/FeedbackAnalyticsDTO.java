package com.sandeep.eventrabackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackAnalyticsDTO {

    private Long   eventId;
    private String eventName;      // maps from Event.title

    private double averageRating;  // 1.0–5.0
    private long   feedbackCount;

    /**
     * Key   = star rating (1–5)
     * Value = number of submissions with that rating
     * e.g.  { 1: 2, 2: 5, 3: 10, 4: 30, 5: 50 }
     */
    private Map<Integer, Long> ratingDistribution;

    /**
     * Percentage of ratings >= 4 stars.
     * e.g. 82.5 means 82.5% of respondents rated 4 or 5.
     */
    private double satisfactionScore;
}
