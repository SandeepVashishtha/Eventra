package com.sandeep.eventrabackend.ratelimit;

import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class RateLimitService {

    private static final long EVICTION_INTERVAL_MS = 60_000L;

    private final Clock clock;
    private final Map<String, Counter> counters = new ConcurrentHashMap<>();
    private final AtomicLong lastEvictionMillis = new AtomicLong(0L);

    public RateLimitService() {
        this(Clock.systemUTC());
    }

    RateLimitService(Clock clock) {
        this.clock = clock;
    }

    public RateLimitResult consume(String endpoint, String clientIp, int capacity, Duration window) {
        if (capacity <= 0) {
            return new RateLimitResult(false, capacity, 0, window.toSeconds());
        }

        maybeEvictExpired(window);

        String key = endpoint + ":" + clientIp;
        Counter counter = counters.computeIfAbsent(key, ignored -> new Counter(clock.instant(), 0));

        synchronized (counter) {
            Instant now = clock.instant();
            if (!now.isBefore(counter.windowStart.plus(window))) {
                counter.windowStart = now;
                counter.requests = 0;
            }

            if (counter.requests >= capacity) {
                long retryAfter = Duration.between(now, counter.windowStart.plus(window)).toSeconds();
                return new RateLimitResult(false, capacity, 0, Math.max(1, retryAfter));
            }

            counter.requests++;
            return new RateLimitResult(true, capacity, capacity - counter.requests, 0);
        }
    }

    private void maybeEvictExpired(Duration window) {
        long nowMillis = clock.millis();
        long previous = lastEvictionMillis.get();
        if (nowMillis - previous < EVICTION_INTERVAL_MS) {
            return;
        }
        if (!lastEvictionMillis.compareAndSet(previous, nowMillis)) {
            return;
        }

        Instant cutoff = clock.instant().minus(window);
        Iterator<Map.Entry<String, Counter>> iterator = counters.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Counter> entry = iterator.next();
            Counter counter = entry.getValue();
            synchronized (counter) {
                // Drop counters whose window has fully elapsed.
                if (!counter.windowStart.plus(window).isAfter(cutoff)) {
                    iterator.remove();
                }
            }
        }
    }

    private static class Counter {
        private Instant windowStart;
        private int requests;

        private Counter(Instant windowStart, int requests) {
            this.windowStart = windowStart;
            this.requests = requests;
        }
    }
}
