package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.service.EventStreamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Set;

/**
 * SSE endpoints matching the frontend RealTime paths under {@code /stream/*}.
 */
@RestController
@RequestMapping("/stream")
@Tag(name = "Realtime Streams", description = "Server-Sent Event topics used by the SPA")
public class StreamController {

    private final EventStreamService eventStreamService;

    public StreamController(EventStreamService eventStreamService) {
        this.eventStreamService = eventStreamService;
    }

    private static final Set<String> AUTH_REQUIRED_TOPICS = Set.of("notifications", "analytics", "live-audience");

    @GetMapping(value = "/{topic}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to a realtime SSE topic")
    public ResponseEntity<SseEmitter> subscribe(
            @PathVariable String topic,
            Authentication authentication) {
        String normalized = topic == null ? "" : topic.trim().toLowerCase(java.util.Locale.ROOT);
        if (AUTH_REQUIRED_TOPICS.contains(normalized)
                && (authentication == null || !authentication.isAuthenticated())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            return ResponseEntity.ok(eventStreamService.createEmitter(normalized));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }
    }
}
