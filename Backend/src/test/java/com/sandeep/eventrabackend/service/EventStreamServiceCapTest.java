package com.sandeep.eventrabackend.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.lang.reflect.Field;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EventStreamServiceCapTest {

    @Test
    @DisplayName("createEmitter refuses once the per-topic cap is reached (#12468)")
    void createEmitterRejectsWhenCapReached() throws Exception {
        EventStreamService service = new EventStreamService();
        int max = maxCap();
        injectCount(service, "events", max);

        assertThrows(IllegalStateException.class, () -> service.createEmitter("events"));
        assertEquals(max, readCount(service, "events").get());
    }

    @Test
    @DisplayName("concurrent createEmitter never exceeds the per-topic cap (#12468)")
    void concurrentCreateEmitterNeverExceedsCap() throws Exception {
        EventStreamService service = new EventStreamService();
        int max = maxCap();
        int headroom = 10;
        injectCount(service, "events", max - headroom);

        int threads = 40;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch ready = new CountDownLatch(threads);
        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger successes = new AtomicInteger();
        AtomicInteger failures = new AtomicInteger();

        for (int i = 0; i < threads; i++) {
            pool.submit(() -> {
                ready.countDown();
                try {
                    start.await();
                    SseEmitter emitter = service.createEmitter("events");
                    if (emitter != null) {
                        successes.incrementAndGet();
                    }
                } catch (IllegalStateException ex) {
                    failures.incrementAndGet();
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        ready.await();
        start.countDown();
        pool.shutdown();
        pool.awaitTermination(15, TimeUnit.SECONDS);

        assertEquals(headroom, successes.get(), "only the remaining headroom may succeed");
        assertEquals(threads - headroom, failures.get());
        assertEquals(max, readCount(service, "events").get());
    }

    private static int maxCap() throws Exception {
        Field f = EventStreamService.class.getDeclaredField("MAX_EMITTERS_PER_TOPIC");
        f.setAccessible(true);
        return f.getInt(null);
    }

    private static void injectCount(EventStreamService service, String topic, int value) throws Exception {
        Field emittersField = EventStreamService.class.getDeclaredField("emittersByTopic");
        emittersField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, CopyOnWriteArrayList<SseEmitter>> emittersByTopic =
                (Map<String, CopyOnWriteArrayList<SseEmitter>>) emittersField.get(service);
        emittersByTopic.put(topic, new CopyOnWriteArrayList<>());

        Field countsField = EventStreamService.class.getDeclaredField("emitterCounts");
        countsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, AtomicInteger> emitterCounts =
                (Map<String, AtomicInteger>) countsField.get(service);
        emitterCounts.put(topic, new AtomicInteger(value));
    }

    private static AtomicInteger readCount(EventStreamService service, String topic) throws Exception {
        Field countsField = EventStreamService.class.getDeclaredField("emitterCounts");
        countsField.setAccessible(true);
        @SuppressWarnings("unchecked")
        Map<String, AtomicInteger> emitterCounts =
                (Map<String, AtomicInteger>) countsField.get(service);
        return emitterCounts.get(topic);
    }
}
