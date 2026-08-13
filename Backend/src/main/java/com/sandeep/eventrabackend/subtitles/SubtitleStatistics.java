package com.sandeep.eventrabackend.subtitles;

import lombok.*;
import java.util.*;

/**
 * Statistics for subtitles (event-level)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubtitleStatistics {
    
    /**
     * Event ID these statistics are for
     */
    private Long eventId;
    
    /**
     * Total number of subtitles
     */
    private long totalCount;
    
    /**
     * Number of displayed subtitles
     */
    private long displayedCount;
    
    /**
     * Average confidence score
     */
    private double averageConfidence;
    
    /**
     * Average latency in milliseconds
     */
    private double averageLatency;
    
    /**
     * Last measured latency in milliseconds
     */
    private long lastLatency;
    
    /**
     * Distribution by language
     */
    private Map<String, Long> languageDistribution = new HashMap<>();
    
    /**
     * Distribution by provider
     */
    private Map<String, Long> providerDistribution = new HashMap<>();
    
    /**
     * Most recent subtitle
     */
    private SubtitleDTO mostRecentSubtitle;
    
    /**
     * First subtitle timestamp
     */
    private Date firstSubtitleTime;
    
    /**
     * Last subtitle timestamp
     */
    private Date lastSubtitleTime;
    
    /**
     * Total duration of all subtitles in milliseconds
     */
    private long totalDurationMs;
    
    /**
     * Average subtitle duration in milliseconds
     */
    private double averageDurationMs;
    
    /**
     * Number of unique languages
     */
    private int uniqueLanguageCount;
    
    /**
     * Number of unique providers
     */
    private int uniqueProviderCount;
    
    /**
     * Get summary as a map
     */
    public Map<String, Object> toSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("eventId", eventId);
        summary.put("totalCount", totalCount);
        summary.put("displayedCount", displayedCount);
        summary.put("averageConfidence", averageConfidence);
        summary.put("averageLatency", averageLatency);
        summary.put("lastLatency", lastLatency);
        summary.put("languageDistribution", languageDistribution);
        summary.put("providerDistribution", providerDistribution);
        summary.put("uniqueLanguageCount", uniqueLanguageCount);
        summary.put("uniqueProviderCount", uniqueProviderCount);
        summary.put("totalDurationMs", totalDurationMs);
        summary.put("averageDurationMs", averageDurationMs);
        return summary;
    }
}
