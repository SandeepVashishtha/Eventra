package com.sandeep.eventrabackend.service;

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

    public SseEmitter createEmitter() {
        return createEmitter("events");
    }

    public SseEmitter createEmitter(String topic) {
        String normalized = normalizeTopic(topic);
        CopyOnWriteArrayList<SseEmitter> emitters =
                emittersByTopic.computeIfAbsent(normalized, key -> new CopyOnWriteArrayList<>());
        AtomicInteger count = emitterCounts.computeIfAbsent(normalized, key -> new AtomicInteger());

        if (count.get() >= MAX_EMITTERS_PER_TOPIC) {
            throw new IllegalStateException(
                    "SSE emitter limit reached for topic '" + normalized + "'");
        }

        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);
        Runnable cleanup = () -> removeEmitter(normalized, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError((ex) -> cleanup.run());

        emitters.add(emitter);
        count.incrementAndGet();

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

    public void publish(String topic, String eventName, Object payload) {
        String normalized = normalizeTopic(topic);
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByTopic.get(normalized);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(payload));
            } catch (IOException ex) {
                removeEmitter(normalized, emitter);
                emitter.completeWithError(ex);
            }
        }
    }

    private void removeEmitter(String topic, SseEmitter emitter) {
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
