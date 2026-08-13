package com.sandeep.eventrabackend.subtitles;

import lombok.*;
import java.util.*;

/**
 * Statistics for a subtitle session
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionStatistics {
    
    /**
     * Total number of subtitles processed
     */
    private long totalSubtitles;
    
    /**
     * Total number of characters processed
     */
    private long totalCharacters;
    
    /**
     * Average confidence score
     */
    private double averageConfidence;
    
    /**
     * Sum of all confidence scores (for calculating average)
     */
    private double confidenceSum;
    
    /**
     * Number of confidence scores recorded
     */
    private long confidenceCount;
    
    /**
     * Distribution of subtitles by language
     */
    private Map<String, Long> languageDistribution = new HashMap<>();
    
    /**
     * Distribution of subtitles by provider
     */
    private Map<String, Long> providerDistribution = new HashMap<>();
    
    /**
     * Start time of statistics tracking
     */
    private Date trackingStart;
    
    /**
     * Last update time
     */
    private Date lastUpdate;
    
    /**
     * Increment total subtitles count
     */
    public void incrementTotalSubtitles() {
        this.totalSubtitles++;
        this.lastUpdate = new Date();
    }
    
    /**
     * Add characters to total
     */
    public void addCharacters(long count) {
        this.totalCharacters += count;
    }
    
    /**
     * Add confidence score for average calculation
     */
    public void addConfidence(double confidence) {
        this.confidenceSum += confidence;
        this.confidenceCount++;
        this.averageConfidence = this.confidenceCount > 0 ? 
            this.confidenceSum / this.confidenceCount : 0.0;
    }
    
    /**
     * Increment language count
     */
    public void incrementLanguageCount(String language) {
        if (language != null) {
            languageDistribution.put(language, 
                languageDistribution.getOrDefault(language, 0L) + 1);
        }
    }
    
    /**
     * Increment provider count
     */
    public void incrementProviderCount(String provider) {
        if (provider != null) {
            providerDistribution.put(provider, 
                providerDistribution.getOrDefault(provider, 0L) + 1);
        }
    }
    
    /**
     * Reset statistics
     */
    public void reset() {
        this.totalSubtitles = 0;
        this.totalCharacters = 0;
        this.confidenceSum = 0.0;
        this.confidenceCount = 0;
        this.averageConfidence = 0.0;
        this.languageDistribution.clear();
        this.providerDistribution.clear();
        this.trackingStart = new Date();
        this.lastUpdate = new Date();
    }
    
    /**
     * Get summary of statistics as a map
     */
    public Map<String, Object> toSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSubtitles", totalSubtitles);
        summary.put("totalCharacters", totalCharacters);
        summary.put("averageConfidence", averageConfidence);
        summary.put("languageDistribution", languageDistribution);
        summary.put("providerDistribution", providerDistribution);
        return summary;
    }
}
