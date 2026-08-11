package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Transaction-free SSE Broadcaster Service (#14085).
 * Decouples SSE stream lifecycles from database transaction scopes to prevent HikariCP pool starvation.
 */
@Service
public class SSEBroadcasterService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    /**
     * Open SSE connection without transactional context annotations.
     */
    public SseEmitter subscribeAttendeeStream() {
        SseEmitter emitter = new SseEmitter(180_000L); // 3-minute timeout
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        return emitter;
    }

    /**
     * Broadcast updates to all live streams.
     */
    public void broadcastEventUpdate(String message) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("event_update").data(message));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }

    public int getActiveSubscriberCount() {
        return emitters.size();
    }
}
