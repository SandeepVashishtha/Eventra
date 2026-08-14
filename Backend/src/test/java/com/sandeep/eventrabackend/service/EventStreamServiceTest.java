package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.dto.response.EventAvailabilityResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
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

        assertDoesNotThrow(() -> service.publish("events", null, "update", "{}"));
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

        assertDoesNotThrow(() -> service.publish("events", null, "update", "{}"));
        assertFalse(emitters.contains(stale));
        assertTrue(emitters.contains(healthy));
        assertEquals(1, count.get());
    }

    @Test
    @DisplayName("broadcastAvailability only fans out to matching or unscoped emitters (#15338)")
    void broadcastAvailabilityRespectsEmitterEventFilters() throws Exception {
        EventStreamService service = new EventStreamService();

        // Capture every availability payload delivered to each emitter.
        List<String> scoped42 = new ArrayList<>();
        List<String> scoped7 = new ArrayList<>();
        List<String> unscoped = new ArrayList<>();

        SseEmitter emitter42 = trackingEmitter(scoped42);
        SseEmitter emitter7 = trackingEmitter(scoped7);
        SseEmitter emitterAll = trackingEmitter(unscoped);

        registerEmitter(service, emitter42, 42L);
        registerEmitter(service, emitter7, 7L);
        registerEmitter(service, emitterAll, null);

        service.broadcastAvailability(42L, availability());
        service.broadcastAvailability(7L, availability());

        assertEquals(1, scoped42.size(), "event-42 subscriber receives event-42 broadcast");
        assertEquals(0, scoped7.size(), "event-7 subscriber does not receive event-42 broadcast");
        assertEquals(2, unscoped.size(), "unscoped subscriber receives every broadcast");
    }

    @Test
    @DisplayName("publish only delivers to emitters scoped to the published eventId plus unscoped subscribers (#16237)")
    void publishScopesToEventId() throws Exception {
        EventStreamService service = new EventStreamService();

        List<String> scoped42 = new ArrayList<>();
        List<String> scoped7 = new ArrayList<>();
        List<String> unscoped = new ArrayList<>();

        SseEmitter emitter42 = trackingEmitter(scoped42);
        SseEmitter emitter7 = trackingEmitter(scoped7);
        SseEmitter emitterAll = trackingEmitter(unscoped);

        registerEmitter(service, emitter42, 42L);
        registerEmitter(service, emitter7, 7L);
        registerEmitter(service, emitterAll, null);

        service.publish("events", 42L, "update", "payload-42");
        service.publish("events", 7L, "update", "payload-7");

        assertEquals(1, scoped42.size(), "event-42 subscriber receives event-42 publish");
        assertEquals(0, scoped7.size(), "event-7 subscriber does not receive event-42 publish");
        assertEquals(2, unscoped.size(), "unscoped subscriber receives every publish");
    }

    @Test
    @DisplayName("broadcastAvailability drops stale scoped emitters without propagating failure (#15338)")
    void broadcastAvailabilityRemovesStaleEmitter() throws Exception {
        EventStreamService service = new EventStreamService();

        SseEmitter stale = new SseEmitter() {
            @Override
            public void send(SseEventBuilder builder) throws IOException {
                throw new IllegalStateException("ResponseBodyEmitter has already completed");
            }
        };
        registerEmitter(service, stale, 42L);

        assertDoesNotThrow(() -> service.broadcastAvailability(42L, availability()));
        assertTrue(serviceEmitterList(service).isEmpty(), "stale emitter is removed after failure");
    }

    private static SseEmitter trackingEmitter(List<String> received) {
        return new SseEmitter() {
            @Override
            public void send(SseEventBuilder builder) throws IOException {
                received.add(String.valueOf(builder));
            }
        };
    }

    private static EventAvailabilityResponse availability() {
        return new EventAvailabilityResponse(100, 10, 90, false, false);
    }

    private static void registerEmitter(EventStreamService service, SseEmitter emitter, Long eventId)
            throws Exception {
        Field emittersField = EventStreamService.class.getDeclaredField("emittersByTopic");
        emittersField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, CopyOnWriteArrayList<SseEmitter>> emittersByTopic =
                (Map<String, CopyOnWriteArrayList<SseEmitter>>) emittersField.get(service);
        CopyOnWriteArrayList<SseEmitter> emitters =
                emittersByTopic.computeIfAbsent("events", key -> new CopyOnWriteArrayList<>());

        Field countsField = EventStreamService.class.getDeclaredField("emitterCounts");
        countsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, AtomicInteger> emitterCounts =
                (Map<String, AtomicInteger>) countsField.get(service);
        AtomicInteger count = emitterCounts.computeIfAbsent("events", key -> new AtomicInteger());
        count.incrementAndGet();

        emitters.add(emitter);

        if (eventId != null) {
            Field filtersField = EventStreamService.class.getDeclaredField("emitterEventFilters");
            filtersField.setAccessible(true);
            @SuppressWarnings("unchecked")
            Map<SseEmitter, Long> filters =
                    (Map<SseEmitter, Long>) filtersField.get(service);
            filters.put(emitter, eventId);
        }
    }

    private static CopyOnWriteArrayList<SseEmitter> serviceEmitterList(EventStreamService service)
            throws Exception {
        Field emittersField = EventStreamService.class.getDeclaredField("emittersByTopic");
        emittersField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, CopyOnWriteArrayList<SseEmitter>> emittersByTopic =
                (Map<String, CopyOnWriteArrayList<SseEmitter>>) emittersField.get(service);
        return emittersByTopic.getOrDefault("events", new CopyOnWriteArrayList<>());
    }
}
