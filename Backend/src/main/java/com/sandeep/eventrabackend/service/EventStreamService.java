package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.response.EventAvailabilityResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Service to manage Server-Sent Events (SSE) emitters for real-time updates.
 */
@Service
public class EventStreamService {
    private static final Logger log = LoggerFactory.getLogger(EventStreamService.class);
    private static final Long DEFAULT_TIMEOUT = 300_000L; // 5 minutes

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    /**
     * Creates a new SseEmitter, registers cleanup hooks, and sends an initial
     * connection event.
     *
     * @return a configured SseEmitter
     */
    public SseEmitter createEmitter() {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        emitter.onCompletion(() -> removeEmitter(emitter));
        emitter.onTimeout(() -> removeEmitter(emitter));
        emitter.onError((ex) -> removeEmitter(emitter));

        emitters.add(emitter);

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Stream connected successfully"));
        } catch (IOException e) {
            log.error("Failed to send initial connection event", e);
            emitter.completeWithError(e);
            throw new RuntimeException("Failed to initialize SSE connection", e);
        }

        return emitter;
    }

    /**
     * Broadcasts an availability update to all connected SSE emitters.
     * The event payload includes the event id and the full availability
     * response so clients can update their seat counters in real-time.
     *
     * @param eventId      the id of the event whose availability changed
     * @param availability the latest availability data for the event
     */
    public void broadcastAvailability(Long eventId, EventAvailabilityResponse availability) {
        if (eventId == null || availability == null) {
            return;
        }

        Map<String, Object> payload = Map.of(
                "eventId", eventId,
                "availability", availability);

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("availability")
                        .data(payload));
            } catch (IOException e) {
                log.warn("Failed to send availability update to emitter, removing it", e);
                removeEmitter(emitter);
            } catch (IllegalStateException e) {
                // Emitter already completed/timed out
                removeEmitter(emitter);
            }
        }
    }

    private void removeEmitter(SseEmitter emitter) {
        emitters.remove(emitter);
    }
}
