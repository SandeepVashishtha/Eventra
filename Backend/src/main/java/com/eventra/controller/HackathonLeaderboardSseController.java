package com.eventra.controller;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.DistributionSummary;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Gauge;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.zip.GZIPOutputStream;

@RestController
@RequestMapping("/api/v1/hackathons")
@EnableScheduling
public class HackathonLeaderboardSseController implements MessageListener, HealthIndicator {

    private static final Logger logger = Logger.getLogger(HackathonLeaderboardSseController.class.getName());
    private static final String REDIS_CHANNEL = "hackathon-leaderboard-cluster-updates";
    private static final int REPLAY_BUFFER_LIMIT = 200;
    private static final int MAX_CONNECTIONS_PER_HACKATHON = 1000;
    private static final long CLIENT_TIMEOUT_MS = 60 * 60 * 1000L; // 1 Hour

    // Core Connection Registry
    private final Map<Long, CopyOnWriteArrayList<ClientSession>> leaderboardSessions = new ConcurrentHashMap<>();
    
    // Ring Buffer per Hackathon for Last-Event-ID catch-up
    private final Map<Long, Deque<LeaderboardSseEvent>> eventBuffers = new ConcurrentHashMap<>();

    // Rate Limiting per IP
    private final Map<String, TokenBucketRateLimiter> ipRateLimiters = new ConcurrentHashMap<>();

    // Debounce & Batching Engine
    private final Map<Long, ConcurrentLinkedQueue<LeaderboardSseEvent>> pendingBatches = new ConcurrentHashMap<>();
    private final ScheduledExecutorService batchScheduler = Executors.newScheduledThreadPool(2);

    private final AtomicBoolean isShuttingDown = new AtomicBoolean(false);

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired(required = false)
    private RedisMessageListenerContainer redisMessageListenerContainer;

    @Autowired(required = false)
    private MeterRegistry meterRegistry;

    // Micrometer Instrumentation
    private Counter activeConnectionsCounter;
    private Counter totalEventsPublishedCounter;
    private Counter failedBroadcastsCounter;
    private Counter rateLimitViolationsCounter;
    private DistributionSummary payloadSizeSummary;

    @PostConstruct
    public void init() {
        if (redisMessageListenerContainer != null) {
            redisMessageListenerContainer.addMessageListener(this, new ChannelTopic(REDIS_CHANNEL));
            logger.info("Subscribed to Redis Cluster Pub/Sub channel: " + REDIS_CHANNEL);
        }

        if (meterRegistry != null) {
            this.activeConnectionsCounter = meterRegistry.counter("sse.connections.registered");
            this.totalEventsPublishedCounter = meterRegistry.counter("sse.events.published");
            this.failedBroadcastsCounter = meterRegistry.counter("sse.broadcasts.failed");
            this.rateLimitViolationsCounter = meterRegistry.counter("sse.ratelimit.violations");
            this.payloadSizeSummary = meterRegistry.summary("sse.payload.bytes");

            Gauge.builder("sse.connections.current.active", this, HackathonLeaderboardSseController::getTotalActiveConnections)
                 .register(meterRegistry);
        }

        // Start 250ms batch flusher for debouncing rapid score submissions
        batchScheduler.scheduleAtFixedRate(this::flushPendingBatches, 250, 250, TimeUnit.MILLISECONDS);
    }

    /**
     * Subscribe to real-time leaderboard stream.
     * Supports filtered streaming by team, last event backfill, and rate limiting.
     */
    @GetMapping(value = "/{id}/leaderboard/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> streamLeaderboardUpdates(
            @PathVariable("id") Long hackathonId,
            @RequestParam(value = "teamId", required = false) Long teamIdFilter,
            @RequestParam(value = "minRank", required = false, defaultValue = "100") Integer maxRankFilter,
            @RequestHeader(value = "Last-Event-ID", required = false) String lastEventId,
            HttpServletRequest request) {

        if (isShuttingDown.get()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        String clientIp = getClientIp(request);
        TokenBucketRateLimiter rateLimiter = ipRateLimiters.computeIfAbsent(clientIp, k -> new TokenBucketRateLimiter(10, 2));
        if (!rateLimiter.tryConsume()) {
            if (rateLimitViolationsCounter != null) rateLimitViolationsCounter.increment();
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }

        CopyOnWriteArrayList<ClientSession> sessions = leaderboardSessions.computeIfAbsent(hackathonId, k -> new CopyOnWriteArrayList<>());

        if (sessions.size() >= MAX_CONNECTIONS_PER_HACKATHON) {
            return ResponseEntity.status(HttpStatus.BANDWIDTH_LIMIT_EXCEEDED).build();
        }

        SseEmitter emitter = new SseEmitter(CLIENT_TIMEOUT_MS);
        ClientSession session = new ClientSession(
                UUID.randomUUID().toString(),
                hackathonId,
                teamIdFilter,
                maxRankFilter,
                clientIp,
                emitter
        );

        sessions.add(session);
        if (activeConnectionsCounter != null) activeConnectionsCounter.increment();

        // Register Lifecycles
        emitter.onCompletion(() -> removeSession(hackathonId, session));
        emitter.onTimeout(() -> removeSession(hackathonId, session));
        emitter.onError(ex -> removeSession(hackathonId, session));

        try {
            // Handshake Ack Event
            LeaderboardSseEvent initEvent = new LeaderboardSseEvent(
                    UUID.randomUUID().toString(),
                    hackathonId,
                    "INIT",
                    Map.of("message", "Connected successfully", "sessionId", session.getSessionId(), "timestamp", System.currentTimeMillis())
            );
            sendDirectEvent(session, initEvent);

            // Replay events missed during network dropouts
            if (lastEventId != null && !lastEventId.isBlank()) {
                replayMissedEvents(hackathonId, lastEventId, session);
            }

        } catch (IOException e) {
            removeSession(hackathonId, session);
        }

        return ResponseEntity.ok(emitter);
    }

    /**
     * Broadcasts leaderboard updates. High-frequency updates get queued into the batch engine.
     */
    @PostMapping("/{id}/leaderboard/broadcast")
    public ResponseEntity<Void> broadcastLeaderboardUpdate(
            @PathVariable("id") Long hackathonId,
            @RequestBody LeaderboardPayload payload,
            @RequestParam(value = "immediate", defaultValue = "false") boolean immediate) {

        LeaderboardSseEvent event = new LeaderboardSseEvent(
                UUID.randomUUID().toString(),
                hackathonId,
                "LEADERBOARD_UPDATE",
                payload
        );

        if (immediate) {
            publishToCluster(event);
        } else {
            // Queue into debouncing engine
            pendingBatches.computeIfAbsent(hackathonId, k -> new ConcurrentLinkedQueue<>()).add(event);
        }

        return ResponseEntity.accepted().build();
    }

    /**
     * Sends compressed JSON snapshot for heavy data initialization.
     */
    @GetMapping("/{id}/leaderboard/snapshot/compressed")
    public ResponseEntity<byte[]> getCompressedSnapshot(@PathVariable("id") Long hackathonId, @RequestBody Object fullLeaderboardData) {
        try {
            byte[] rawBytes = fullLeaderboardData.toString().getBytes(StandardCharsets.UTF_8);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (GZIPOutputStream gzipOut = new GZIPOutputStream(baos)) {
                gzipOut.write(rawBytes);
            }
            byte[] compressed = baos.toByteArray();

            return ResponseEntity.ok()
                    .header("Content-Encoding", "gzip")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(compressed);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Cluster synchronization callback via Redis.
     */
    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            if (redisTemplate != null) {
                Object deserialized = redisTemplate.getValueSerializer().deserialize(message.getBody());
                if (deserialized instanceof LeaderboardSseEvent event) {
                    processAndBroadcastLocal(event);
                }
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to process Redis message", e);
        }
    }

    private void publishToCluster(LeaderboardSseEvent event) {
        if (redisTemplate != null) {
            redisTemplate.convertAndSend(REDIS_CHANNEL, event);
        } else {
            processAndBroadcastLocal(event);
        }
    }

    private void processAndBroadcastLocal(LeaderboardSseEvent event) {
        storeInReplayBuffer(event);

        CopyOnWriteArrayList<ClientSession> sessions = leaderboardSessions.get(event.getHackathonId());
        if (sessions == null || sessions.isEmpty()) return;

        for (ClientSession session : sessions) {
            // Apply filtering logic
            if (shouldDeliverToSession(session, event)) {
                try {
                    sendDirectEvent(session, event);
                } catch (Exception e) {
                    if (failedBroadcastsCounter != null) failedBroadcastsCounter.increment();
                    removeSession(event.getHackathonId(), session);
                }
            }
        }
    }

    private boolean shouldDeliverToSession(ClientSession session, LeaderboardSseEvent event) {
        if (!(event.getPayload() instanceof LeaderboardPayload payload)) {
            return true;
        }

        // Filter by targeted Team ID if the client specified one
        if (session.getTeamIdFilter() != null && payload.getAffectedTeamId() != null) {
            if (!session.getTeamIdFilter().equals(payload.getAffectedTeamId())) {
                return false;
            }
        }

        // Filter out ranks outside the client's requested view threshold
        if (payload.getRank() != null && payload.getRank() > session.getMaxRankFilter()) {
            return false;
        }

        return true;
    }

    private void flushPendingBatches() {
        pendingBatches.forEach((hackathonId, queue) -> {
            if (!queue.isEmpty()) {
                List<LeaderboardSseEvent> batch = new ArrayList<>();
                LeaderboardSseEvent event;
                while ((event = queue.poll()) != null) {
                    batch.add(event);
                }

                if (!batch.isEmpty()) {
                    LeaderboardSseEvent batchEvent = new LeaderboardSseEvent(
                            UUID.randomUUID().toString(),
                            hackathonId,
                            "BATCHED_LEADERBOARD_UPDATE",
                            batch
                    );
                    publishToCluster(batchEvent);
                }
            }
        });
    }

    /**
     * 15-second ping task to pass proxy firewalls & measure connection health.
     */
    @Scheduled(fixedRate = 15000)
    public void sendKeepAlivePing() {
        leaderboardSessions.forEach((hackathonId, sessions) -> {
            for (ClientSession session : sessions) {
                try {
                    session.getEmitter().send(SseEmitter.event()
                            .name("PING")
                            .data(Map.of("timestamp", System.currentTimeMillis())));
                    session.updateLastPing();
                } catch (Exception e) {
                    removeSession(hackathonId, session);
                }
            }
        });
    }

    private void storeInReplayBuffer(LeaderboardSseEvent event) {
        Deque<LeaderboardSseEvent> buffer = eventBuffers.computeIfAbsent(
                event.getHackathonId(), k -> new ArrayDeque<>()
        );
        synchronized (buffer) {
            if (buffer.size() >= REPLAY_BUFFER_LIMIT) {
                buffer.pollFirst();
            }
            buffer.addLast(event);
        }
    }

    private void replayMissedEvents(Long hackathonId, String lastEventId, ClientSession session) throws IOException {
        Deque<LeaderboardSseEvent> buffer = eventBuffers.get(hackathonId);
        if (buffer == null) return;

        List<LeaderboardSseEvent> events;
        synchronized (buffer) {
            events = new ArrayList<>(buffer);
        }

        boolean found = false;
        for (LeaderboardSseEvent event : events) {
            if (found) {
                if (shouldDeliverToSession(session, event)) {
                    sendDirectEvent(session, event);
                }
            } else if (event.getEventId().equals(lastEventId)) {
                found = true;
            }
        }
    }

    private void sendDirectEvent(ClientSession session, LeaderboardSseEvent event) throws IOException {
        session.getEmitter().send(SseEmitter.event()
                .id(event.getEventId())
                .name(event.getEventType())
                .data(event.getPayload(), MediaType.APPLICATION_JSON));

        session.incrementEventCount();
        if (totalEventsPublishedCounter != null) totalEventsPublishedCounter.increment();
    }

    private void removeSession(Long hackathonId, ClientSession session) {
        CopyOnWriteArrayList<ClientSession> sessions = leaderboardSessions.get(hackathonId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                leaderboardSessions.remove(hackathonId);
            }
        }
    }

    public int getTotalActiveConnections() {
        return leaderboardSessions.values().stream().mapToInt(CopyOnWriteArrayList::size).sum();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @Override
    public Health health() {
        if (isShuttingDown.get()) {
            return Health.down().withDetail("reason", "Server shutting down").build();
        }
        return Health.up()
                .withDetail("activeConnections", getTotalActiveConnections())
                .withDetail("activeHackathonsMonitored", leaderboardSessions.size())
                .withDetail("redisClusterConnected", redisTemplate != null)
                .build();
    }

    @PreDestroy
    public void gracefulShutdown() {
        isShuttingDown.set(true);
        logger.info("Draining active SSE leaderboard streams for graceful shutdown...");
        batchScheduler.shutdown();

        leaderboardSessions.forEach((hackathonId, sessions) -> {
            for (ClientSession session : sessions) {
                try {
                    session.getEmitter().send(SseEmitter.event()
                            .name("SYSTEM_SHUTDOWN")
                            .data("Server is restarting. Please reconnect shortly."));
                    session.getEmitter().complete();
                } catch (Exception ignored) {}
            }
        });
        leaderboardSessions.clear();
    }

    // =========================================================================
    // INNER CLASSES & DATA STRUCTURES
    // =========================================================================

    public static class ClientSession {
        private final String sessionId;
        private final Long hackathonId;
        private final Long teamIdFilter;
        private final Integer maxRankFilter;
        private final String ipAddress;
        private final SseEmitter emitter;
        private final long connectedAt;
        private final AtomicLong eventsSent = new AtomicLong(0);
        private volatile long lastPingTimestamp;

        public ClientSession(String sessionId, Long hackathonId, Long teamIdFilter, Integer maxRankFilter, String ipAddress, SseEmitter emitter) {
            this.sessionId = sessionId;
            this.hackathonId = hackathonId;
            this.teamIdFilter = teamIdFilter;
            this.maxRankFilter = maxRankFilter != null ? maxRankFilter : Integer.MAX_VALUE;
            this.ipAddress = ipAddress;
            this.emitter = emitter;
            this.connectedAt = System.currentTimeMillis();
            this.lastPingTimestamp = System.currentTimeMillis();
        }

        public String getSessionId() { return sessionId; }
        public Long getHackathonId() { return hackathonId; }
        public Long getTeamIdFilter() { return teamIdFilter; }
        public Integer getMaxRankFilter() { return maxRankFilter; }
        public SseEmitter getEmitter() { return emitter; }
        public void updateLastPing() { this.lastPingTimestamp = System.currentTimeMillis(); }
        public void incrementEventCount() { eventsSent.incrementAndGet(); }
    }

    public static class LeaderboardSseEvent implements Serializable {
        private static final long serialVersionUID = 1L;

        private String eventId;
        private Long hackathonId;
        private String eventType;
        private Object payload;
        private long timestamp;

        public LeaderboardSseEvent() {}

        public LeaderboardSseEvent(String eventId, Long hackathonId, String eventType, Object payload) {
            this.eventId = eventId;
            this.hackathonId = hackathonId;
            this.eventType = eventType;
            this.payload = payload;
            this.timestamp = Instant.now().toEpochMilli();
        }

        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public Long getHackathonId() { return hackathonId; }
        public void setHackathonId(Long hackathonId) { this.hackathonId = hackathonId; }
        public String getEventType() { return eventType; }
        public void setEventType(String eventType) { this.eventType = eventType; }
        public Object getPayload() { return payload; }
        public void setPayload(Object payload) { this.payload = payload; }
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }

    public static class LeaderboardPayload implements Serializable {
        private static final long serialVersionUID = 1L;

        private Long affectedTeamId;
        private Integer rank;
        private Double score;
        private Object fullLeaderboard;

        public LeaderboardPayload() {}

        public Long getAffectedTeamId() { return affectedTeamId; }
        public void setAffectedTeamId(Long affectedTeamId) { this.affectedTeamId = affectedTeamId; }
        public Integer getRank() { return rank; }
        public void setRank(Integer rank) { this.rank = rank; }
        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }
        public Object getFullLeaderboard() { return fullLeaderboard; }
        public void setFullLeaderboard(Object fullLeaderboard) { this.fullLeaderboard = fullLeaderboard; }
    }

    /**
     * In-memory token bucket rate limiter for endpoint protection.
     */
    private static class TokenBucketRateLimiter {
        private final long capacity;
        private final double refillRatePerSecond;
        private double tokens;
        private long lastRefillTimestamp;

        public TokenBucketRateLimiter(long capacity, double refillRatePerSecond) {
            this.capacity = capacity;
            this.refillRatePerSecond = refillRatePerSecond;
            this.tokens = capacity;
            this.lastRefillTimestamp = System.nanoTime();
        }

        public synchronized boolean tryConsume() {
            long now = System.nanoTime();
            double elapsedSeconds = (now - lastRefillTimestamp) / 1e9;
            tokens = Math.min(capacity, tokens + elapsedSeconds * refillRatePerSecond);
            lastRefillTimestamp = now;

            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }
    }
}