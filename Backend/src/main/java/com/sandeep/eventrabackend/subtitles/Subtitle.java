package com.sandeep.eventrabackend.subtitles;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.Objects;

/**
 * Subtitle entity for storing real-time multilingual subtitles
 * 
 * This entity represents a subtitle that can be displayed to users
 * in their preferred language during live events.
 */
@Entity
@Table(name = "subtitles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subtitle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Unique identifier for the subtitle (UUID format)
     */
    @Column(nullable = false, unique = true, length = 64)
    private String uuid;
    
    /**
     * Event ID this subtitle belongs to
     */
    @Column(name = "event_id", nullable = false)
    private Long eventId;
    
    /**
     * Original text (in source language)
     */
    @Column(name = "original_text", columnDefinition = "TEXT")
    private String originalText;
    
    /**
     * Translated text (in target language)
     */
    @Column(name = "translated_text", columnDefinition = "TEXT", nullable = false)
    private String translatedText;
    
    /**
     * Source language code (ISO 639-1)
     */
    @Column(name = "source_language", length = 10, nullable = false)
    private String sourceLanguage;
    
    /**
     * Target language code (ISO 639-1)
     */
    @Column(name = "target_language", length = 10, nullable = false)
    private String targetLanguage;
    
    /**
     * Confidence score of the transcription (0.0 - 1.0)
     */
    @Column(name = "confidence")
    private Double confidence;
    
    /**
     * Provider used for transcription/translation
     */
    @Column(name = "provider", length = 50)
    private String provider;
    
    /**
     * User ID who generated this subtitle (organizer/performer)
     */
    @Column(name = "user_id")
    private Long userId;
    
    /**
     * Session ID for grouping subtitles from the same session
     */
    @Column(name = "session_id", length = 64)
    private String sessionId;
    
    /**
     * Timestamp when the subtitle was created
     */
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
    
    /**
     * Timestamp when the subtitle should start displaying
     */
    @Column(name = "start_time")
    private Instant startTime;
    
    /**
     * Timestamp when the subtitle should end displaying
     */
    @Column(name = "end_time")
    private Instant endTime;
    
    /**
     * Duration of the subtitle in milliseconds
     */
    @Column(name = "duration_ms")
    private Long durationMs;
    
    /**
     * Sequence number for ordering subtitles
     */
    @Column(name = "sequence_number")
    private Long sequenceNumber;
    
    /**
     * Whether this is the final version of the subtitle
     */
    @Column(name = "is_final")
    private Boolean isFinal = false;
    
    /**
     * Whether this subtitle has been moderated/approved
     */
    @Column(name = "is_approved")
    private Boolean isApproved = false;
    
    /**
     * Moderation notes
     */
    @Column(name = "moderation_notes", columnDefinition = "TEXT")
    private String moderationNotes;
    
    /**
     * Additional metadata as JSON
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    // Pre-persist hook to set default values
    @PrePersist
    protected void onCreate() {
        if (this.uuid == null || this.uuid.isEmpty()) {
            this.uuid = java.util.UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.sequenceNumber == null) {
            this.sequenceNumber = System.currentTimeMillis();
        }
        if (this.isFinal == null) {
            this.isFinal = false;
        }
        if (this.isApproved == null) {
            this.isApproved = false;
        }
    }
    
    /**
     * Check if subtitle is currently active (should be displayed)
     */
    public boolean isActive(Instant currentTime) {
        if (this.startTime == null || this.endTime == null) {
            return false;
        }
        return !currentTime.isBefore(this.startTime) && !currentTime.isAfter(this.endTime);
    }
    
    /**
     * Check if subtitle has expired
     */
    public boolean isExpired(Instant currentTime) {
        if (this.endTime == null) {
            return false;
        }
        return currentTime.isAfter(this.endTime);
    }
    
    /**
     * Get display duration in milliseconds
     */
    public long getDisplayDuration() {
        if (this.durationMs != null) {
            return this.durationMs;
        }
        if (this.startTime != null && this.endTime != null) {
            return this.endTime.toEpochMilli() - this.startTime.toEpochMilli();
        }
        return 5000; // Default 5 seconds
    }
    
    /**
     * Set display times based on current time and duration
     */
    public void setDisplayTimes(long durationMs) {
        Instant now = Instant.now();
        this.startTime = now;
        this.endTime = now.plusMillis(durationMs);
        this.durationMs = durationMs;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Subtitle subtitle = (Subtitle) o;
        if (id != null && subtitle.id != null) {
            return Objects.equals(id, subtitle.id);
        }
        return uuid != null && Objects.equals(uuid, subtitle.uuid);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id != null ? id : uuid);
    }

    @Override
    public String toString() {
        return "Subtitle{" +
                "id=" + id +
                ", uuid='" + uuid + '\'' +
                ", eventId=" + eventId +
                ", originalText='" + originalText + '\'' +
                ", translatedText='" + translatedText + '\'' +
                ", sourceLanguage='" + sourceLanguage + '\'' +
                ", targetLanguage='" + targetLanguage + '\'' +
                ", confidence=" + confidence +
                ", provider='" + provider + '\'' +
                ", createdAt=" + createdAt +
                ", isFinal=" + isFinal +
                '}';
    }
}
