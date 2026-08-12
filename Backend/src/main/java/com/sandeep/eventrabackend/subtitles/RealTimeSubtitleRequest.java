package com.sandeep.eventrabackend.subtitles;

import lombok.*;

/**
 * Request DTO for creating a real-time subtitle
 * 
 * This is used when receiving audio data that needs to be transcribed and translated.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RealTimeSubtitleRequest {
    
    /**
     * Event ID this subtitle belongs to
     */
    private Long eventId;
    
    /**
     * Original text (from transcription)
     */
    private String originalText;
    
    /**
     * Translated text (optional, if translation is done client-side)
     */
    private String translatedText;
    
    /**
     * Source language code (ISO 639-1)
     */
    private String sourceLanguage = "en";
    
    /**
     * Target language code (ISO 639-1)
     */
    private String targetLanguage = "en";
    
    /**
     * Confidence score of the transcription (0.0 - 1.0)
     */
    private Double confidence;
    
    /**
     * Provider used for transcription/translation
     */
    private String provider;
    
    /**
     * User ID of the performer/organizer
     */
    private Long userId;
    
    /**
     * Session ID for grouping subtitles
     */
    private String sessionId;
    
    /**
     * Audio data as base64 encoded string (optional)
     */
    private String audioData;
    
    /**
     * Audio format (wav, mp3, ogg, webm)
     */
    private String audioFormat;
    
    /**
     * Sample rate of the audio
     */
    private Integer sampleRate;
    
    /**
     * Duration of the subtitle in milliseconds
     */
    private Long durationMs;
    
    /**
     * Timestamp when the audio was recorded
     */
    private Long audioTimestamp;
    
    /**
     * Whether this is a final subtitle (not to be updated)
     */
    private Boolean isFinal = false;
    
    /**
     * Priority of this subtitle (for ordering)
     */
    private Integer priority = 0;
    
    /**
     * Additional metadata as JSON string
     */
    private String metadata;
    
    /**
     * Check if this request contains audio data for transcription
     */
    public boolean hasAudioData() {
        return audioData != null && !audioData.isEmpty();
    }
    
    /**
     * Check if translation is needed
     */
    public boolean needsTranslation() {
        return translatedText == null || translatedText.isEmpty();
    }
}
