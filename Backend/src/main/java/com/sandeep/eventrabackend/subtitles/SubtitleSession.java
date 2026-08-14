package com.sandeep.eventrabackend.subtitles;

import lombok.*;
import java.time.Instant;

/**
 * Represents a subtitle session for real-time streaming
 * 
 * A session groups multiple subtitles from the same live stream.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubtitleSession {
    
    /**
     * Unique session identifier
     */
    private String sessionId;
    
    /**
     * Event ID this session belongs to
     */
    private Long eventId;
    
    /**
     * User ID of the performer/organizer
     */
    private Long userId;
    
    /**
     * Source language for the session
     */
    private String sourceLanguage = "en";
    
    /**
     * Current target languages (can be multiple for multilingual streaming)
     */
    @Builder.Default
    private java.util.Set<String> targetLanguages = java.util.concurrent.ConcurrentHashMap.newKeySet();
    
    /**
     * Session status
     */
    @Builder.Default
    private SessionStatus status = SessionStatus.ACTIVE;
    
    /**
     * When the session was started
     */
    private Instant startedAt;
    
    /**
     * When the session was ended
     */
    private Instant endedAt;
    
    /**
     * Last activity timestamp
     */
    private Instant lastActivity;
    
    /**
     * The last subtitle in this session
     */
    private Subtitle lastSubtitle;
    
    /**
     * Statistics for this session
     */
    @Builder.Default
    private SessionStatistics statistics = new SessionStatistics();
    
    /**
     * Additional metadata
     */
    @Builder.Default
    private java.util.Map<String, Object> metadata = new java.util.concurrent.ConcurrentHashMap<>();
    
    /**
     * Add a target language to the session
     */
    public void addTargetLanguage(String language) {
        if (language != null && !language.isEmpty()) {
            targetLanguages.add(language);
        }
    }
    
    /**
     * Remove a target language from the session
     */
    public void removeTargetLanguage(String language) {
        targetLanguages.remove(language);
    }
    
    /**
     * Check if session is active
     */
    public boolean isActive() {
        return status == SessionStatus.ACTIVE && 
               (endedAt == null || endedAt.isAfter(Instant.now()));
    }
    
    /**
     * Check if session has expired (no activity for a long time)
     */
    public boolean isExpired(long timeoutMinutes) {
        if (lastActivity == null) return false;
        
        Instant timeoutTime = lastActivity.plusSeconds(timeoutMinutes * 60);
        return Instant.now().isAfter(timeoutTime);
    }
    
    /**
     * Update session statistics
     */
    public void updateStatistics(Subtitle subtitle) {
        if (statistics == null) {
            statistics = new SessionStatistics();
        }
        
        statistics.incrementTotalSubtitles();
        
        if (subtitle.getConfidence() != null) {
            statistics.addConfidence(subtitle.getConfidence());
        }
        
        if (subtitle.getTargetLanguage() != null) {
            statistics.incrementLanguageCount(subtitle.getTargetLanguage());
        }
    }
    
    @Override
    public String toString() {
        return "SubtitleSession{" +
                "sessionId='" + sessionId + '\'' +
                ", eventId=" + eventId +
                ", userId=" + userId +
                ", status=" + status +
                ", startedAt=" + startedAt +
                ", lastActivity=" + lastActivity +
                '}';
    }
}
