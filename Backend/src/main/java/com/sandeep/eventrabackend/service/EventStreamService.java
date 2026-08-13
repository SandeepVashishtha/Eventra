package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.response.EventAvailabilityResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Multiplexed SSE emitter registry keyed by topic
 * ({@code events}, {@code leaderboard}, {@code analytics}, …).
 * Caps concurrent emitters per topic to avoid unbounded growth.
 */
@Service
public class EventStreamService {
    private static final Logger log = LoggerFactory.getLogger(EventStreamService.class);
    private static final Long DEFAULT_TIMEOUT = 300_000L; // 5 minutes
    private static final int MAX_EMITTERS_PER_TOPIC = 200;
    private static final Set<String> KNOWN_TOPICS = Set.of(
            "events", "leaderboard", "analytics", "notifications", "live-audience"
    );

    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emittersByTopic = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> emitterCounts = new ConcurrentHashMap<>();
    private final Map<SseEmitter, Long> emitterEventFilters = new ConcurrentHashMap<>();

    public SseEmitter createEmitter() {
        return createEmitter("events");
    }

    public SseEmitter createEmitter(String topic) {
        return createEmitter(topic, null);
    }

    /**
     * Creates a topic emitter, optionally scoped to a single {@code eventId}.
     * Scoped emitters only receive availability broadcasts for that event;
     * unscoped emitters keep receiving every event's availability (legacy
     * behavior for the shared {@code /api/events/stream} and {@code /stream/events}
     * connections).
     */
    public SseEmitter createEmitter(String topic, Long eventId) {
        String normalized = normalizeTopic(topic);
        CopyOnWriteArrayList<SseEmitter> emitters =
                emittersByTopic.computeIfAbsent(normalized, key -> new CopyOnWriteArrayList<>());
        AtomicInteger count = emitterCounts.computeIfAbsent(normalized, key -> new AtomicInteger());

        int current = count.incrementAndGet();
        if (current > MAX_EMITTERS_PER_TOPIC) {
            count.decrementAndGet();
            throw new IllegalStateException(
                    "SSE emitter limit reached for topic '" + normalized + "'");
        }

        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        if (eventId != null) {
            emitterEventFilters.put(emitter, eventId);
        }
        Runnable cleanup = () -> removeEmitter(normalized, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError((ex) -> cleanup.run());

        emitters.add(emitter);

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("{\"topic\":\"" + normalized + "\",\"status\":\"connected\"}"));
        } catch (IOException e) {
            log.error("Failed to send initial connection event for topic {}", normalized, e);
            cleanup.run();
            emitter.completeWithError(e);
            throw new RuntimeException("Failed to initialize SSE connection", e);
        }

        return emitter;
    }

    public void publish(String topic, Long eventId, String eventName, Object payload) {
        String normalized = normalizeTopic(topic);
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByTopic.get(normalized);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            Long filter = emitterEventFilters.get(emitter);
            if (filter != null && !filter.equals(eventId)) {
                continue;
            }
            try {
                emitter.send(SseEmitter.event().name(eventName).data(payload));
            } catch (IOException ex) {
                removeEmitter(normalized, emitter);
                emitter.completeWithError(ex);
            }
        }
    }

    public void broadcastAvailability(Long eventId, EventAvailabilityResponse availability) {
        if (eventId == null || availability == null) return;
        publishAvailability(eventId, Map.of("eventId", eventId, "availability", availability));
    }

    /**
     * Fans out an availability broadcast only to {@code events}-topic emitters
     * that either have no {@code eventId} filter (shared stream) or whose filter
     * matches the broadcast {@code eventId}. Scoped subscribers never observe the
     * registration churn of events they did not subscribe to.
     */
    private void publishAvailability(Long eventId, Map<String, Object> payload) {
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByTopic.get("events");
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            Long filter = emitterEventFilters.get(emitter);
            if (filter != null && !filter.equals(eventId)) {
                continue;
            }
            try {
                emitter.send(SseEmitter.event().name("availability").data(payload));
            } catch (IOException ex) {
                removeEmitter("events", emitter);
                emitter.completeWithError(ex);
            }
        }
    }

    private void removeEmitter(String topic, SseEmitter emitter) {
        emitterEventFilters.remove(emitter);
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByTopic.get(topic);
        if (emitters != null && emitters.remove(emitter)) {
            AtomicInteger count = emitterCounts.get(topic);
            if (count != null) {
                count.updateAndGet(value -> Math.max(0, value - 1));
            }
        }
    }

    private static String normalizeTopic(String topic) {
        if (topic == null || topic.isBlank()) {
            return "events";
        }
        String normalized = topic.trim().toLowerCase();
        if (!KNOWN_TOPICS.contains(normalized)) {
            throw new IllegalArgumentException("Unknown SSE topic: " + topic);
        }
        return normalized;
    }
}
