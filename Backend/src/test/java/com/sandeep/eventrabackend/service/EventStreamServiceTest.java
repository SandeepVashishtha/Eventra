package com.sandeep.eventrabackend.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EventStreamServiceTest {

    @Test
    @DisplayName("publish removes a stale emitter without propagating the send failure (#12464)")
    void publishDoesNotPropagateStaleEmitterFailure() throws Exception {
        EventStreamService service = new EventStreamService();

        Field emittersField = EventStreamService.class.getDeclaredField("emittersByTopic");
        emittersField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, CopyOnWriteArrayList<SseEmitter>> emittersByTopic =
                (Map<String, CopyOnWriteArrayList<SseEmitter>>) emittersField.get(service);

        Field countsField = EventStreamService.class.getDeclaredField("emitterCounts");
        countsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, AtomicInteger> emitterCounts =
                (Map<String, AtomicInteger>) countsField.get(service);

        CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
        AtomicInteger count = new AtomicInteger(1);
        emittersByTopic.put("events", emitters);
        emitterCounts.put("events", count);

        SseEmitter stale = new SseEmitter() {
            @Override
            public void send(SseEventBuilder builder) throws IOException {
                throw new IllegalStateException("ResponseBodyEmitter has already completed");
            }
        };
        emitters.add(stale);

        assertDoesNotThrow(() -> service.publish("events", "update", "{}"));
        assertFalse(emitters.contains(stale));
        assertEquals(0, count.get());
    }

    @Test
    @DisplayName("publish keeps delivering to healthy emitters when one is stale (#12464)")
    void publishKeepsDeliveringToHealthyEmitters() throws Exception {
        EventStreamService service = new EventStreamService();

        Field emittersField = EventStreamService.class.getDeclaredField("emittersByTopic");
        emittersField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, CopyOnWriteArrayList<SseEmitter>> emittersByTopic =
                (Map<String, CopyOnWriteArrayList<SseEmitter>>) emittersField.get(service);

        Field countsField = EventStreamService.class.getDeclaredField("emitterCounts");
        countsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, AtomicInteger> emitterCounts =
                (Map<String, AtomicInteger>) countsField.get(service);

        CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
        AtomicInteger count = new AtomicInteger(2);
        emittersByTopic.put("events", emitters);
        emitterCounts.put("events", count);

        SseEmitter stale = new SseEmitter() {
            @Override
            public void send(SseEventBuilder builder) throws IOException {
                throw new IllegalStateException("ResponseBodyEmitter has already completed");
            }
        };
        SseEmitter healthy = new SseEmitter() {
            @Override
            public void send(SseEventBuilder builder) throws IOException {
                // no-op: simulate a successful send
            }
        };
        emitters.add(stale);
        emitters.add(healthy);

        assertDoesNotThrow(() -> service.publish("events", "update", "{}"));
        assertFalse(emitters.contains(stale));
        assertTrue(emitters.contains(healthy));
        assertEquals(1, count.get());
    }
}
