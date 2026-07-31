package com.sandeep.eventrabackend.ratelimit;

import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Clock clock;
    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

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

    private static class Counter {
        private Instant windowStart;
        private int requests;

        private Counter(Instant windowStart, int requests) {
            this.windowStart = windowStart;
            this.requests = requests;
        }
    }
}
