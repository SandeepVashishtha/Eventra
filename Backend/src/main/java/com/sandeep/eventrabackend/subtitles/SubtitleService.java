package com.sandeep.eventrabackend.subtitles;

import com.sandeep.eventrabackend.websocket.RedisPubSubRelay;
import com.sandeep.eventrabackend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing real-time multilingual subtitles
 * 
 * This service handles:
 * - Creating and managing subtitles for live events
 * - Streaming subtitles to clients via SSE
 * - Managing subtitle sessions
 * - Integration with external transcription/translation services
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SubtitleService {
    
    private final SubtitleRepository subtitleRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final RedisPubSubRelay redisPubSubRelay;

    
    // Configuration values
    @Value("${subtitle.default-duration-ms:5000}")
    private long defaultSubtitleDuration;
    
    @Value("${subtitle.max-history-size:100}")
    private int maxHistorySize;
    
    @Value("${subtitle.buffer-size:10}")
    private int bufferSize;
    
    /**
     * In-memory cache for recent subtitles (for low-latency access)
     */
    private final Map<String, List<Subtitle>> eventSubtitleCache = new HashMap<>();
    private final Map<String, List<Subtitle>> sessionSubtitleCache = new HashMap<>();
    
    /**
     * Active subtitle sessions (for WebSocket/SSE streaming)
     */
    private final Map<String, SubtitleSession> activeSessions = new HashMap<>();
    
    /**
     * Create a new subtitle
     */
    @Transactional
    public Subtitle createSubtitle(SubtitleDTO subtitleDTO) {
        Subtitle subtitle = subtitleDTO.toEntity();
        
        // Set default values if not provided
        if (subtitle.getUuid() == null || subtitle.getUuid().isEmpty()) {
            subtitle.setUuid(UUID.randomUUID().toString());
        }
        if (subtitle.getCreatedAt() == null) {
            subtitle.setCreatedAt(Instant.now());
        }
        if (subtitle.getSequenceNumber() == null) {
            subtitle.setSequenceNumber(Instant.now().toEpochMilli());
        }
        if (subtitle.getIsFinal() == null) {
            subtitle.setIsFinal(false);
        }
        if (subtitle.getIsApproved() == null) {
            subtitle.setIsApproved(false);
        }
        
        // Set display times if not provided
        if (subtitle.getStartTime() == null || subtitle.getEndTime() == null) {
            subtitle.setDisplayTimes(defaultSubtitleDuration);
        }
        
        // Save to database
        subtitle = subtitleRepository.save(subtitle);
        
        // Add to cache
        addToCache(subtitle);
        
        // Publish event for live SSE streaming and pub/sub cluster relay
        if (eventPublisher != null) {
            eventPublisher.publishEvent(new SubtitleCreatedEvent(this, subtitle));
        }
        if (redisPubSubRelay != null && subtitle.getEventId() != null) {
            redisPubSubRelay.publishMessage("subtitles:event:" + subtitle.getEventId(), "subtitle_id:" + subtitle.getId());
        }
        
        log.info("Created subtitle {} for event {}", subtitle.getId(), subtitle.getEventId());
        
        return subtitle;
    }
    
    /**
     * Create a real-time subtitle (for streaming)
     */
    @Transactional
    public Subtitle createRealTimeSubtitle(RealTimeSubtitleRequest request) {
        Subtitle subtitle = new Subtitle();
        subtitle.setUuid(UUID.randomUUID().toString());
        subtitle.setEventId(request.getEventId());
        subtitle.setOriginalText(request.getOriginalText());
        subtitle.setTranslatedText(request.getTranslatedText());
        subtitle.setSourceLanguage(request.getSourceLanguage());
        subtitle.setTargetLanguage(request.getTargetLanguage());
        subtitle.setConfidence(request.getConfidence());
        subtitle.setProvider(request.getProvider());
        subtitle.setUserId(request.getUserId());
        subtitle.setSessionId(request.getSessionId());
        subtitle.setCreatedAt(Instant.now());
        subtitle.setSequenceNumber(Instant.now().toEpochMilli());
        subtitle.setIsFinal(false);
        subtitle.setIsApproved(true); // Auto-approve real-time subtitles
        
        // Set display times
        long duration = request.getDurationMs() != null ? request.getDurationMs() : defaultSubtitleDuration;
        subtitle.setDisplayTimes(duration);
        
        // Save to database
        subtitle = subtitleRepository.save(subtitle);
        
        // Add to cache and notify session
        addToCache(subtitle);
        notifySessionUpdate(subtitle.getSessionId(), subtitle);
        
        // Publish event for live SSE streaming and pub/sub cluster relay
        if (eventPublisher != null) {
            eventPublisher.publishEvent(new SubtitleCreatedEvent(this, subtitle));
        }
        if (redisPubSubRelay != null && subtitle.getEventId() != null) {
            redisPubSubRelay.publishMessage("subtitles:event:" + subtitle.getEventId(), "subtitle_id:" + subtitle.getId());
        }
        
        log.debug("Created real-time subtitle {} for session {}", subtitle.getId(), subtitle.getSessionId());
        
        return subtitle;
    }
    
    /**
     * Update a subtitle
     */
    @Transactional
    public Subtitle updateSubtitle(Long id, SubtitleDTO subtitleDTO) {
        Subtitle existingSubtitle = subtitleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subtitle not found with id: " + id));
        
        // Update fields from DTO
        if (subtitleDTO.getOriginalText() != null) {
            existingSubtitle.setOriginalText(subtitleDTO.getOriginalText());
        }
        if (subtitleDTO.getTranslatedText() != null) {
            existingSubtitle.setTranslatedText(subtitleDTO.getTranslatedText());
        }
        if (subtitleDTO.getSourceLanguage() != null) {
            existingSubtitle.setSourceLanguage(subtitleDTO.getSourceLanguage());
        }
        if (subtitleDTO.getTargetLanguage() != null) {
            existingSubtitle.setTargetLanguage(subtitleDTO.getTargetLanguage());
        }
        if (subtitleDTO.getConfidence() != null) {
            existingSubtitle.setConfidence(subtitleDTO.getConfidence());
        }
        if (subtitleDTO.getProvider() != null) {
            existingSubtitle.setProvider(subtitleDTO.getProvider());
        }
        if (subtitleDTO.getIsFinal() != null) {
            existingSubtitle.setIsFinal(subtitleDTO.getIsFinal());
        }
        if (subtitleDTO.getIsApproved() != null) {
            existingSubtitle.setIsApproved(subtitleDTO.getIsApproved());
        }
        if (subtitleDTO.getModerationNotes() != null) {
            existingSubtitle.setModerationNotes(subtitleDTO.getModerationNotes());
        }
        
        // Update display times if provided
        if (subtitleDTO.getDurationMs() != null) {
            existingSubtitle.setDisplayTimes(subtitleDTO.getDurationMs());
        }
        
        // Save and update cache
        existingSubtitle = subtitleRepository.save(existingSubtitle);
        updateCache(existingSubtitle);
        
        // Notify session if applicable
        if (existingSubtitle.getSessionId() != null) {
            notifySessionUpdate(existingSubtitle.getSessionId(), existingSubtitle);
        }
        
        return existingSubtitle;
    }
    
    /**
     * Mark a subtitle as final (completed)
     */
    @Transactional
    public Subtitle finalizeSubtitle(Long id) {
        Subtitle subtitle = subtitleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subtitle not found with id: " + id));
        
        subtitle.setIsFinal(true);
        subtitle = subtitleRepository.save(subtitle);
        updateCache(subtitle);
        
        log.debug("Finalized subtitle {}", id);
        
        return subtitle;
    }
    
    /**
     * Get subtitle by ID
     */
    public Optional<Subtitle> getSubtitleById(Long id) {
        return subtitleRepository.findById(id);
    }
    
    /**
     * Get subtitle by UUID
     */
    public Optional<Subtitle> getSubtitleByUuid(String uuid) {
        return subtitleRepository.findByUuid(uuid);
    }
    
    /**
     * Get subtitles by event ID
     */
    public List<Subtitle> getSubtitlesByEventId(Long eventId) {
        // Try cache first
        List<Subtitle> cached = eventSubtitleCache.get("event_" + eventId);
        if (cached != null) {
            return new ArrayList<>(cached);
        }
        
        // Fetch from database
        List<Subtitle> subtitles = subtitleRepository.findByEventId(eventId);
        
        // Sort by sequence number
        subtitles.sort(Comparator.comparing(Subtitle::getSequenceNumber));
        
        // Add to cache
        eventSubtitleCache.put("event_" + eventId, subtitles);
        
        return subtitles;
    }
    
    /**
     * Get active subtitles for an event
     */
    public List<Subtitle> getActiveSubtitlesByEventId(Long eventId) {
        return subtitleRepository.findActiveSubtitlesByEventId(eventId, Instant.now());
    }
    
    /**
     * Get recent subtitles for an event (paginated)
     */
    public Page<Subtitle> getRecentSubtitlesByEventId(Long eventId, Pageable pageable) {
        return subtitleRepository.findByEventId(eventId, pageable);
    }
    
    /**
     * Get subtitles by session ID
     */
    public List<Subtitle> getSubtitlesBySessionId(String sessionId) {
        // Try cache first
        List<Subtitle> cached = sessionSubtitleCache.get("session_" + sessionId);
        if (cached != null) {
            return new ArrayList<>(cached);
        }
        
        // Fetch from database
        List<Subtitle> subtitles = subtitleRepository.findBySessionId(sessionId);
        
        // Sort by sequence number
        subtitles.sort(Comparator.comparing(Subtitle::getSequenceNumber));
        
        // Add to cache
        sessionSubtitleCache.put("session_" + sessionId, subtitles);
        
        return subtitles;
    }
    
    /**
     * Get subtitles by user ID
     */
    public List<Subtitle> getSubtitlesByUserId(Long userId) {
        return subtitleRepository.findByUserId(userId);
    }
    
    /**
     * Delete subtitle by ID
     */
    @Transactional
    public void deleteSubtitle(Long id) {
        Subtitle subtitle = subtitleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subtitle not found with id: " + id));
        
        // Remove from cache
        removeFromCache(subtitle);
        
        // Delete from database
        subtitleRepository.delete(subtitle);
        
        log.info("Deleted subtitle {}", id);
    }
    
    /**
     * Delete subtitles by session ID
     */
    @Transactional
    public void deleteSubtitlesBySessionId(String sessionId) {
        // Remove from cache
        sessionSubtitleCache.remove("session_" + sessionId);
        
        // Delete from database
        subtitleRepository.deleteBySessionId(sessionId);
        
        // Remove session from active sessions
        activeSessions.remove(sessionId);
        
        log.info("Deleted subtitles for session {}", sessionId);
    }
    
    /**
     * Delete subtitles by event ID
     */
    @Transactional
    public void deleteSubtitlesByEventId(Long eventId) {
        // Remove from cache
        eventSubtitleCache.remove("event_" + eventId);
        
        // Delete from database
        subtitleRepository.deleteByEventId(eventId);
        
        log.info("Deleted subtitles for event {}", eventId);
    }
    
    /**
     * Delete expired subtitles
     */
    @Transactional
    public int deleteExpiredSubtitles() {
        Instant cutoff = Instant.now().minusSeconds(24 * 3600); // 24 hours
        
        // Find expired subtitles
        List<Subtitle> expired = subtitleRepository.findByCreatedAtBefore(cutoff);
        
        // Remove from cache
        expired.forEach(this::removeFromCache);
        
        // Delete from database
        subtitleRepository.deleteByCreatedAtBefore(cutoff);
        
        log.info("Deleted {} expired subtitles", expired.size());
        
        return expired.size();
    }
    
    /**
     * Start a new subtitle session
     */
    public SubtitleSession startSession(String sessionId, Long eventId, Long userId) {
        SubtitleSession session = new SubtitleSession();
        session.setSessionId(sessionId);
        session.setEventId(eventId);
        session.setUserId(userId);
        session.setStartedAt(Instant.now());
        session.setLastActivity(Instant.now());
        session.setStatus(SessionStatus.ACTIVE);
        
        activeSessions.put(sessionId, session);
        
        log.info("Started subtitle session {} for event {}", sessionId, eventId);
        
        return session;
    }
    
    /**
     * End a subtitle session
     */
    public SubtitleSession endSession(String sessionId) {
        SubtitleSession session = activeSessions.get(sessionId);
        if (session != null) {
            session.setStatus(SessionStatus.ENDED);
            session.setEndedAt(Instant.now());
            
            // Clean up cache
            sessionSubtitleCache.remove("session_" + sessionId);
            
            log.info("Ended subtitle session {}", sessionId);
        }
        
        return session;
    }
    
    /**
     * Get active session by ID
     */
    public Optional<SubtitleSession> getSession(String sessionId) {
        return Optional.ofNullable(activeSessions.get(sessionId));
    }
    
    /**
     * Update session last activity time
     */
    public void updateSessionActivity(String sessionId) {
        SubtitleSession session = activeSessions.get(sessionId);
        if (session != null) {
            session.setLastActivity(Instant.now());
        }
    }
    
    /**
     * Get all active sessions for an event
     */
    public List<SubtitleSession> getActiveSessionsByEventId(Long eventId) {
        return activeSessions.values().stream()
                .filter(session -> session.getEventId().equals(eventId))
                .filter(session -> session.getStatus() == SessionStatus.ACTIVE)
                .collect(Collectors.toList());
    }
    
    /**
     * Add subtitle to cache
     */
    private void addToCache(Subtitle subtitle) {
        // Add to event cache
        String eventKey = "event_" + subtitle.getEventId();
        eventSubtitleCache.computeIfAbsent(eventKey, k -> new ArrayList<>()).add(subtitle);
        
        // Add to session cache
        if (subtitle.getSessionId() != null) {
            String sessionKey = "session_" + subtitle.getSessionId();
            sessionSubtitleCache.computeIfAbsent(sessionKey, k -> new ArrayList<>()).add(subtitle);
        }
        
        // Limit cache size
        trimCache();
    }
    
    /**
     * Update subtitle in cache
     */
    private void updateCache(Subtitle subtitle) {
        // Update in event cache
        String eventKey = "event_" + subtitle.getEventId();
        List<Subtitle> eventSubtitles = eventSubtitleCache.get(eventKey);
        if (eventSubtitles != null) {
            int index = eventSubtitles.indexOf(subtitle);
            if (index >= 0) {
                eventSubtitles.set(index, subtitle);
            }
        }
        
        // Update in session cache
        if (subtitle.getSessionId() != null) {
            String sessionKey = "session_" + subtitle.getSessionId();
            List<Subtitle> sessionSubtitles = sessionSubtitleCache.get(sessionKey);
            if (sessionSubtitles != null) {
                int index = sessionSubtitles.indexOf(subtitle);
                if (index >= 0) {
                    sessionSubtitles.set(index, subtitle);
                }
            }
        }
    }
    
    /**
     * Remove subtitle from cache
     */
    private void removeFromCache(Subtitle subtitle) {
        // Remove from event cache
        String eventKey = "event_" + subtitle.getEventId();
        List<Subtitle> eventSubtitles = eventSubtitleCache.get(eventKey);
        if (eventSubtitles != null) {
            eventSubtitles.removeIf(sub -> sub.getId().equals(subtitle.getId()));
        }
        
        // Remove from session cache
        if (subtitle.getSessionId() != null) {
            String sessionKey = "session_" + subtitle.getSessionId();
            List<Subtitle> sessionSubtitles = sessionSubtitleCache.get(sessionKey);
            if (sessionSubtitles != null) {
                sessionSubtitles.removeIf(sub -> sub.getId().equals(subtitle.getId()));
            }
        }
    }
    
    /**
     * Trim cache to prevent memory issues
     */
    private void trimCache() {
        // Trim event cache — must update map entries, not reassign local variable
        eventSubtitleCache.forEach((key, subtitles) -> {
            if (subtitles.size() > maxHistorySize) {
                eventSubtitleCache.put(key, new ArrayList<>(subtitles.subList(Math.max(0, subtitles.size() - maxHistorySize), subtitles.size())));
            }
        });
        
        // Trim session cache — must update map entries, not reassign local variable
        sessionSubtitleCache.forEach((key, subtitles) -> {
            if (subtitles.size() > bufferSize) {
                sessionSubtitleCache.put(key, new ArrayList<>(subtitles.subList(Math.max(0, subtitles.size() - bufferSize), subtitles.size())));
            }
        });
        
        // Limit number of cached events
        if (eventSubtitleCache.size() > 100) {
            eventSubtitleCache.keySet().stream()
                    .skip(50)
                    .forEach(eventSubtitleCache::remove);
        }
        
        // Limit number of cached sessions
        if (sessionSubtitleCache.size() > 200) {
            sessionSubtitleCache.keySet().stream()
                    .skip(100)
                    .forEach(sessionSubtitleCache::remove);
        }
    }
    
    /**
     * Notify session subscribers about subtitle update
     */
    private void notifySessionUpdate(String sessionId, Subtitle subtitle) {
        SubtitleSession session = activeSessions.get(sessionId);
        if (session != null) {
            session.setLastSubtitle(subtitle);
            session.setLastActivity(Instant.now());
            
            // In a real implementation, this would trigger SSE/WebSocket notifications
            // For now, we just update the session state
        }
    }
    
    /**
     * Get subtitle count for an event
     */
    public long getSubtitleCountByEventId(Long eventId) {
        return subtitleRepository.countByEventId(eventId);
    }
    
    /**
     * Get subtitle statistics for an event
     */
    public SubtitleStatistics getEventStatistics(Long eventId) {
        List<Subtitle> subtitles = getSubtitlesByEventId(eventId);
        
        SubtitleStatistics stats = new SubtitleStatistics();
        stats.setEventId(eventId);
        stats.setTotalCount(subtitles.size());
        
        if (!subtitles.isEmpty()) {
            // Calculate average confidence
            Double avgConfidence = subtitles.stream()
                    .filter(sub -> sub.getConfidence() != null)
                    .mapToDouble(Subtitle::getConfidence)
                    .average()
                    .orElse(0.0);
            stats.setAverageConfidence(avgConfidence);
            
            // Count by language
            Map<String, Long> languageCounts = subtitles.stream()
                    .collect(Collectors.groupingBy(
                            Subtitle::getTargetLanguage,
                            Collectors.counting()
                    ));
            stats.setLanguageDistribution(languageCounts);
            
            // Count by provider
            Map<String, Long> providerCounts = subtitles.stream()
                    .filter(sub -> sub.getProvider() != null)
                    .collect(Collectors.groupingBy(
                            Subtitle::getProvider,
                            Collectors.counting()
                    ));
            stats.setProviderDistribution(providerCounts);
            
            // Get most recent subtitle
            Subtitle mostRecent = subtitles.stream()
                    .max(Comparator.comparing(Subtitle::getCreatedAt))
                    .orElse(null);
            stats.setMostRecentSubtitle(mostRecent != null ? SubtitleDTO.fromEntity(mostRecent) : null);
        }
        
        return stats;
    }
}
