package com.sandeep.eventrabackend.subtitles;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.*;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Controller for Server-Sent Events (SSE) streaming of real-time subtitles
 * 
 * This controller provides:
 * - Low-latency subtitle streaming to clients
 * - Event-specific subtitle channels
 * - Session-based subtitle streaming
 * - Connection management and cleanup
 */
@RestController
@RequestMapping("/api/v1/subtitles/stream")
@Slf4j
@RequiredArgsConstructor
public class SubtitleStreamController {
    
    private final SubtitleService subtitleService;
    
    /**
     * Map of event ID to active SSE emitters and their requested target
     * language. A {@code null} language means the emitter receives subtitles
     * in every language; a non-null language restricts live delivery to that
     * language (issue #15335).
     */
    private final Map<Long, Map<SseEmitter, String>> eventEmitters = new ConcurrentHashMap<>();
    
    /**
     * Map of session ID to list of active SSE emitters
     */
    private final Map<String, List<SseEmitter>> sessionEmitters = new ConcurrentHashMap<>();
    
    /**
     * Map of emitter ID to emitter (for cleanup)
     */
    private final Map<String, SseEmitter> emitterRegistry = new ConcurrentHashMap<>();
    
    /**
     * Timeout for SSE connections (in milliseconds)
     */
    private static final long SSE_TIMEOUT = 60 * 60 * 1000; // 1 hour
    
    // ==================== SSE Streaming Endpoints ====================
    
    /**
     * Stream subtitles for a specific event
     * 
     * Clients connect to this endpoint to receive real-time subtitle updates
     * for a particular event. The connection remains open and subtitles are
     * streamed as they become available.
     * 
     * @param eventId The event ID to stream subtitles for
     * @return SseEmitter for streaming subtitles
     */
    @GetMapping("/event/{eventId}")
    public SseEmitter streamEventSubtitles(@PathVariable Long eventId) {
        SseEmitter emitter = createEmitter();
        
        // Register emitter
        registerEventEmitter(eventId, emitter);
        
        // Send initial data (active subtitles)
        sendInitialSubtitles(eventId, emitter);
        
        // Handle completion and timeout
        emitter.onCompletion(() -> unregisterEventEmitter(eventId, emitter));
        emitter.onTimeout(() -> unregisterEventEmitter(eventId, emitter));
        
        log.info("Client connected to subtitle stream for event {}", eventId);
        
        return emitter;
    }
    
    /**
     * Stream subtitles for a specific session
     * 
     * Clients connect to this endpoint to receive real-time subtitle updates
     * for a particular subtitle session. This is useful when a performer is
     * speaking and subtitles need to be displayed in real-time.
     * 
     * @param sessionId The session ID to stream subtitles for
     * @return SseEmitter for streaming subtitles
     */
    @GetMapping("/session/{sessionId}")
    public SseEmitter streamSessionSubtitles(@PathVariable String sessionId) {
        SseEmitter emitter = createEmitter();
        
        // Register emitter
        registerSessionEmitter(sessionId, emitter);
        
        // Send initial data (recent subtitles from session)
        sendInitialSessionSubtitles(sessionId, emitter);
        
        // Handle completion and timeout
        emitter.onCompletion(() -> unregisterSessionEmitter(sessionId, emitter));
        emitter.onTimeout(() -> unregisterSessionEmitter(sessionId, emitter));
        
        log.info("Client connected to subtitle stream for session {}", sessionId);
        
        return emitter;
    }
    
    /**
     * Stream subtitles for a specific language and event
     * 
     * @param eventId The event ID
     * @param language The target language code
     * @return SseEmitter for streaming subtitles in the specified language
     */
    @GetMapping("/event/{eventId}/language/{language}")
    public SseEmitter streamEventSubtitlesByLanguage(
            @PathVariable Long eventId,
            @PathVariable String language) {
        SseEmitter emitter = createEmitter();
        
        // Register emitter with language filter
        registerEventEmitter(eventId, emitter, language);
        
        // Send initial data (active subtitles in the specified language)
        List<Subtitle> subtitles = subtitleService.getSubtitlesByEventId(eventId);
        subtitles.stream()
                .filter(sub -> language.equalsIgnoreCase(sub.getTargetLanguage()))
                .forEach(sub -> sendSubtitle(emitter, sub, "subtitle"));
        
        // Handle completion and timeout
        emitter.onCompletion(() -> unregisterEventEmitter(eventId, emitter));
        emitter.onTimeout(() -> unregisterEventEmitter(eventId, emitter));
        
        log.info("Client connected to subtitle stream for event {} in language {}", eventId, language);
        
        return emitter;
    }
    
    // ==================== SSE Management ====================
    
    /**
     * Create a new SSE emitter with timeout
     */
    private SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);
        String emitterId = UUID.randomUUID().toString();
        emitterRegistry.put(emitterId, emitter);
        
        // Clean up on timeout
        emitter.onTimeout(() -> emitterRegistry.remove(emitterId));
        emitter.onCompletion(() -> emitterRegistry.remove(emitterId));
        
        return emitter;
    }
    
    /**
     * Register an emitter for an event (receives every language)
     */
    private void registerEventEmitter(Long eventId, SseEmitter emitter) {
        registerEventEmitter(eventId, emitter, null);
    }

    /**
     * Register an emitter for an event, optionally scoped to a target language
     */
    private void registerEventEmitter(Long eventId, SseEmitter emitter, String language) {
        eventEmitters.computeIfAbsent(eventId, k -> new ConcurrentHashMap<>()).put(emitter, language);

        log.debug("Registered emitter for event {}", eventId);
    }
    
    /**
     * Register an emitter for a session
     */
    private void registerSessionEmitter(String sessionId, SseEmitter emitter) {
        sessionEmitters.computeIfAbsent(sessionId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        
        log.debug("Registered emitter for session {}", sessionId);
    }
    
    /**
     * Unregister an emitter for an event
     */
    private void unregisterEventEmitter(Long eventId, SseEmitter emitter) {
        Map<SseEmitter, String> emitters = eventEmitters.get(eventId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                eventEmitters.remove(eventId);
            }
        }
        
        log.debug("Unregistered emitter for event {}", eventId);
    }
    
    /**
     * Unregister an emitter for a session
     */
    private void unregisterSessionEmitter(String sessionId, SseEmitter emitter) {
        List<SseEmitter> emitters = sessionEmitters.get(sessionId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                sessionEmitters.remove(sessionId);
            }
        }
        
        log.debug("Unregistered emitter for session {}", sessionId);
    }
    
    /**
     * Send initial subtitles for an event
     */
    private void sendInitialSubtitles(Long eventId, SseEmitter emitter) {
        List<Subtitle> subtitles = subtitleService.getActiveSubtitlesByEventId(eventId);
        
        subtitles.forEach(sub -> {
            try {
                sendSubtitle(emitter, sub, "subtitle");
            } catch (Exception e) {
                log.error("Error sending initial subtitle for event {}: {}", eventId, e.getMessage());
            }
        });
        
        // Send a "ready" event to indicate connection is established
        try {
            emitter.send(SseEmitter.event()
                    .name("ready")
                    .data(Map.of("status", "connected", "eventId", eventId)));
        } catch (IOException e) {
            log.error("Error sending ready event: {}", e.getMessage());
        }
    }
    
    /**
     * Send initial subtitles for a session
     */
    private void sendInitialSessionSubtitles(String sessionId, SseEmitter emitter) {
        List<Subtitle> subtitles = subtitleService.getSubtitlesBySessionId(sessionId);
        
        subtitles.forEach(sub -> {
            try {
                sendSubtitle(emitter, sub, "subtitle");
            } catch (Exception e) {
                log.error("Error sending initial subtitle for session {}: {}", sessionId, e.getMessage());
            }
        });
        
        // Send a "ready" event
        try {
            emitter.send(SseEmitter.event()
                    .name("ready")
                    .data(Map.of("status", "connected", "sessionId", sessionId)));
        } catch (IOException e) {
            log.error("Error sending ready event: {}", e.getMessage());
        }
    }
    
    /**
     * Send a subtitle via SSE
     */
    public void sendSubtitle(SseEmitter emitter, Subtitle subtitle, String eventName) {
        try {
            SubtitleDTO dto = SubtitleDTO.fromEntity(subtitle);
            emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(dto));
        } catch (IOException e) {
            log.error("Error sending subtitle via SSE: {}", e.getMessage());
        }
    }
    
    /**
     * Broadcast a subtitle to all clients subscribed to an event
     */
    public void broadcastToEvent(Long eventId, Subtitle subtitle) {
        Map<SseEmitter, String> emitters = eventEmitters.get(eventId);
        if (emitters != null) {
            emitters.forEach((emitter, language) -> {
                if (language == null || language.equalsIgnoreCase(subtitle.getTargetLanguage())) {
                    sendSubtitle(emitter, subtitle, "subtitle");
                }
            });
        }
    }
    
    /**
     * Broadcast a subtitle to all clients subscribed to a session
     */
    public void broadcastToSession(String sessionId, Subtitle subtitle) {
        List<SseEmitter> emitters = sessionEmitters.get(sessionId);
        if (emitters != null) {
            emitters.forEach(emitter -> sendSubtitle(emitter, subtitle, "subtitle"));
        }
    }
    
    /**
     * Broadcast an event to all clients subscribed to an event
     */
    public void broadcastEvent(Long eventId, String eventName, Object data) {
        Map<SseEmitter, String> emitters = eventEmitters.get(eventId);
        if (emitters != null) {
            emitters.keySet().forEach(emitter -> {
                try {
                    emitter.send(SseEmitter.event()
                            .name(eventName)
                            .data(data));
                } catch (IOException e) {
                    log.error("Error broadcasting event {} to event {}: {}", 
                            eventName, eventId, e.getMessage());
                }
            });
        }
    }
    
    /**
     * Get statistics about active connections
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getConnectionStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Count active emitters by event
        Map<Long, Integer> eventCounts = new HashMap<>();
        eventEmitters.forEach((eventId, emitters) -> 
            eventCounts.put(eventId, emitters.size()));
        
        // Count active emitters by session
        Map<String, Integer> sessionCounts = new HashMap<>();
        sessionEmitters.forEach((sessionId, emitters) -> 
            sessionCounts.put(sessionId, emitters.size()));
        
        stats.put("totalEventConnections", eventEmitters.values().stream().mapToInt(Map::size).sum());
        stats.put("totalSessionConnections", sessionEmitters.values().stream().mapToInt(List::size).sum());
        stats.put("activeEvents", eventCounts);
        stats.put("activeSessions", sessionCounts);
        stats.put("timestamp", new Date());
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Close all connections for a specific event
     */
    @PostMapping("/event/{eventId}/disconnect")
    public ResponseEntity<Map<String, Object>> disconnectEventClients(@PathVariable Long eventId) {
        Map<SseEmitter, String> emitters = eventEmitters.remove(eventId);
        
        if (emitters != null) {
            emitters.keySet().forEach(emitter -> {
                try {
                    emitter.complete();
                } catch (Exception e) {
                    log.error("Error completing emitter: {}", e.getMessage());
                }
            });
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("disconnectedCount", emitters != null ? emitters.size() : 0);
        response.put("timestamp", new Date());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Close all connections for a specific session
     */
    @PostMapping("/session/{sessionId}/disconnect")
    public ResponseEntity<Map<String, Object>> disconnectSessionClients(@PathVariable String sessionId) {
        List<SseEmitter> emitters = sessionEmitters.remove(sessionId);
        
        if (emitters != null) {
            emitters.forEach(emitter -> {
                try {
                    emitter.complete();
                } catch (Exception e) {
                    log.error("Error completing emitter: {}", e.getMessage());
                }
            });
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("disconnectedCount", emitters != null ? emitters.size() : 0);
        response.put("timestamp", new Date());
        
        return ResponseEntity.ok(response);
    }
    
    // ==================== Helper Methods ====================
    
    /**
     * Notify all event subscribers about a new subtitle
     * 
     * This method is called by the service when a new subtitle is created
     */
    public void notifyEventSubscribers(Long eventId, Subtitle subtitle) {
        broadcastToEvent(eventId, subtitle);
    }
    
    /**
     * Notify all session subscribers about a new subtitle
     * 
     * This method is called by the service when a new subtitle is created for a session
     */
    public void notifySessionSubscribers(String sessionId, Subtitle subtitle) {
        broadcastToSession(sessionId, subtitle);
    }
}
