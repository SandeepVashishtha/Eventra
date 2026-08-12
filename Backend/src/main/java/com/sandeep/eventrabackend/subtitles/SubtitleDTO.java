package com.sandeep.eventrabackend.subtitles;

import lombok.*;
import java.time.Instant;
import java.util.Map;

/**
 * Data Transfer Object for Subtitle
 * 
 * Used for API requests and responses
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubtitleDTO {
    
    private Long id;
    private String uuid;
    private Long eventId;
    private String originalText;
    private String translatedText;
    private String sourceLanguage;
    private String targetLanguage;
    private Double confidence;
    private String provider;
    private Long userId;
    private String sessionId;
    private Instant createdAt;
    private Instant startTime;
    private Instant endTime;
    private Long durationMs;
    private Long sequenceNumber;
    private Boolean isFinal;
    private Boolean isApproved;
    private String moderationNotes;
    private Map<String, Object> metadata;
    
    /**
     * Create DTO from entity
     */
    public static SubtitleDTO fromEntity(Subtitle subtitle) {
        if (subtitle == null) {
            return null;
        }
        
        return SubtitleDTO.builder()
                .id(subtitle.getId())
                .uuid(subtitle.getUuid())
                .eventId(subtitle.getEventId())
                .originalText(subtitle.getOriginalText())
                .translatedText(subtitle.getTranslatedText())
                .sourceLanguage(subtitle.getSourceLanguage())
                .targetLanguage(subtitle.getTargetLanguage())
                .confidence(subtitle.getConfidence())
                .provider(subtitle.getProvider())
                .userId(subtitle.getUserId())
                .sessionId(subtitle.getSessionId())
                .createdAt(subtitle.getCreatedAt())
                .startTime(subtitle.getStartTime())
                .endTime(subtitle.getEndTime())
                .durationMs(subtitle.getDurationMs())
                .sequenceNumber(subtitle.getSequenceNumber())
                .isFinal(subtitle.getIsFinal())
                .isApproved(subtitle.getIsApproved())
                .moderationNotes(subtitle.getModerationNotes())
                .build();
    }
    
    /**
     * Convert DTO to entity
     */
    public Subtitle toEntity() {
        Subtitle subtitle = new Subtitle();
        subtitle.setId(this.id);
        subtitle.setUuid(this.uuid);
        subtitle.setEventId(this.eventId);
        subtitle.setOriginalText(this.originalText);
        subtitle.setTranslatedText(this.translatedText);
        subtitle.setSourceLanguage(this.sourceLanguage);
        subtitle.setTargetLanguage(this.targetLanguage);
        subtitle.setConfidence(this.confidence);
        subtitle.setProvider(this.provider);
        subtitle.setUserId(this.userId);
        subtitle.setSessionId(this.sessionId);
        subtitle.setCreatedAt(this.createdAt);
        subtitle.setStartTime(this.startTime);
        subtitle.setEndTime(this.endTime);
        subtitle.setDurationMs(this.durationMs);
        subtitle.setSequenceNumber(this.sequenceNumber);
        subtitle.setIsFinal(this.isFinal);
        subtitle.setIsApproved(this.isApproved);
        subtitle.setModerationNotes(this.moderationNotes);
        
        return subtitle;
    }
}
