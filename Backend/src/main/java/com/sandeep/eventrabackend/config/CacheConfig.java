package com.sandeep.eventrabackend.config;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tag;
import io.micrometer.core.instrument.binder.cache.CacheMeterBinder;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.cache.interceptor.SimpleCacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.util.StringUtils;

import java.io.Serializable;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Enterprise-Grade Redis Caching, Observability, Distributed Locking, and Resilience Platform.
 *
 * <p>Provides multi-region cache configuration, graceful fault tolerance, thundering herd protection,
 * distributed rate limiting, pub/sub multi-node cache invalidation, and Micrometer metrics.
 */
@Configuration
@EnableCaching
@EnableAspectJAutoProxy
@EnableConfigurationProperties(CacheConfig.CacheCustomProperties.class)
public class CacheConfig extends CachingConfigurerSupport {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    public static final String CACHE_EVENTS = "events";
    public static final String CACHE_HACKATHONS = "hackathons";
    public static final String CACHE_LEADERBOARD = "leaderboard";
    public static final String CACHE_USER_PROFILES = "user_profiles";
    public static final String CACHE_ANALYTICS = "analytics";
    public static final String CACHE_SYSTEM_METRICS = "system_metrics";
    public static final String INVALIDATION_TOPIC = "eventra:cache:invalidation:channel";

    private final CacheCustomProperties cacheCustomProperties;

    public CacheConfig(CacheCustomProperties cacheCustomProperties) {
        this.cacheCustomProperties = cacheCustomProperties;
    }

    // ============================================================================================
    // 1. SERIALIZER & OBJECTMAPPER CONFIGURATION
    // ============================================================================================

    @Bean
    public ObjectMapper redisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        mapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
        mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }

    @Bean
    public GenericJackson2JsonRedisSerializer jsonRedisSerializer(ObjectMapper redisObjectMapper) {
        return new GenericJackson2JsonRedisSerializer(redisObjectMapper);
    }

    // ============================================================================================
    // 2. REDIS TEMPLATE BEANS
    // ============================================================================================

    @Bean
    public RedisTemplate<String, Object> redisTemplate(
            RedisConnectionFactory connectionFactory,
            GenericJackson2JsonRedisSerializer jsonRedisSerializer) {
        
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setValueSerializer(jsonRedisSerializer);
        template.setHashValueSerializer(jsonRedisSerializer);
        template.setEnableTransactionSupport(true);
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public RedisTemplate<String, CacheInvalidationMessage> invalidationRedisTemplate(
            RedisConnectionFactory connectionFactory,
            GenericJackson2JsonRedisSerializer jsonRedisSerializer) {
        
        RedisTemplate<String, CacheInvalidationMessage> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(jsonRedisSerializer);
        template.afterPropertiesSet();
        return template;
    }

    // ============================================================================================
    // 3. PRIMARY REDIS CACHE MANAGER
    // ============================================================================================

    @Bean
    @Primary
    @ConditionalOnProperty(prefix = "spring.cache", name = "type", havingValue = "redis", matchIfMissing = true)
    public CacheManager cacheManager(
            RedisConnectionFactory connectionFactory,
            GenericJackson2JsonRedisSerializer jsonRedisSerializer) {

        RedisCacheConfiguration defaultCacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(cacheCustomProperties.getDefaultTtlMinutes()))
                .computePrefixWith(cacheName -> cacheCustomProperties.getKeyPrefix() + ":" + cacheName + ":")
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonRedisSerializer));

        if (!cacheCustomProperties.isCacheNullValues()) {
            defaultCacheConfig = defaultCacheConfig.disableCachingNullValues();
        }

        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
        
        // Dynamic region allocation with unique TTLs
        cacheConfigurations.put(CACHE_EVENTS, defaultCacheConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put(CACHE_HACKATHONS, defaultCacheConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigurations.put(CACHE_LEADERBOARD, defaultCacheConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigurations.put(CACHE_USER_PROFILES, defaultCacheConfig.entryTtl(Duration.ofHours(1)));
        cacheConfigurations.put(CACHE_ANALYTICS, defaultCacheConfig.entryTtl(Duration.ofHours(6)));
        cacheConfigurations.put(CACHE_SYSTEM_METRICS, defaultCacheConfig.entryTtl(Duration.ofMinutes(1)));

        RedisCacheWriter cacheWriter = RedisCacheWriter.nonLockingRedisCacheWriter(connectionFactory);

        return RedisCacheManager.builder(cacheWriter)
                .cacheDefaults(defaultCacheConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()
                .build();
    }

    // ============================================================================================
    // 4. FAULT-TOLERANT RESILIENT CACHE ERROR HANDLER (CIRCUIT BREAKER PATTERN)
    // ============================================================================================

    @Override
    @Bean
    public CacheErrorHandler errorHandler() {
        return new GracefulCacheErrorHandler();
    }

    public static class GracefulCacheErrorHandler extends SimpleCacheErrorHandler {

        private static final Logger log = LoggerFactory.getLogger(GracefulCacheErrorHandler.class);

        @Override
        public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
            log.warn("Redis unreachable during GET for cache [{}] with key [{}]. Falling back to direct execution. Error: {}",
                    cache.getName(), key, exception.getMessage());
        }

        @Override
        public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
            log.error("Redis unreachable during PUT for cache [{}] with key [{}]. Write operation preserved in DB. Error: {}",
                    cache.getName(), key, exception.getMessage());
        }

        @Override
        public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
            log.error("Redis unreachable during EVICT for cache [{}] with key [{}]. Stale data warning! Error: {}",
                    cache.getName(), key, exception.getMessage());
        }

        @Override
        public void handleCacheClearError(RuntimeException exception, Cache cache) {
            log.error("Redis unreachable during CLEAR for cache [{}]. Error: {}", cache.getName(), exception.getMessage());
        }
    }

    // ============================================================================================
    // 5. ADVANCED KEY GENERATORS
    // ============================================================================================

    @Bean("smartCacheKeyGenerator")
    public KeyGenerator smartCacheKeyGenerator() {
        return new SmartCacheKeyGenerator();
    }

    @Bean("pageableCacheKeyGenerator")
    public KeyGenerator pageableCacheKeyGenerator() {
        return new PageableCacheKeyGenerator();
    }

    public static class SmartCacheKeyGenerator implements KeyGenerator {

        @Override
        public Object generate(Object target, Method method, Object... params) {
            StringBuilder sb = new StringBuilder();
            sb.append(target.getClass().getSimpleName()).append(":");
            sb.append(method.getName()).append(":");

            if (params.length == 0) {
                sb.append("NO_ARGS");
            } else {
                String paramString = Arrays.stream(params)
                        .map(p -> p == null ? "NULL" : p.toString())
                        .collect(Collectors.joining(","));
                
                if (paramString.length() > 64) {
                    sb.append(DigestUtils.md5DigestAsHex(paramString.getBytes(StandardCharsets.UTF_8)));
                } else {
                    sb.append(paramString);
                }
            }
            return sb.toString();
        }
    }

    public static class PageableCacheKeyGenerator implements KeyGenerator {

        @Override
        public Object generate(Object target, Method method, Object... params) {
            StringBuilder sb = new StringBuilder();
            sb.append(method.getName());

            for (Object param : params) {
                if (param instanceof Pageable pageable) {
                    sb.append(":page=").append(pageable.getPageNumber())
                      .append(":size=").append(pageable.getPageSize())
                      .append(":sort=").append(pageable.getSort().toString().replace(" ", ""));
                } else if (param != null) {
                    sb.append(":").append(param);
                }
            }
            return sb.toString();
        }
    }

    // ============================================================================================
    // 6. DISTRIBUTED LOCK MANAGEMENT & STAMPEDE PROTECTION
    // ============================================================================================

    @Bean
    public RedisDistributedLockManager distributedLockManager(RedisTemplate<String, Object> redisTemplate) {
        return new RedisDistributedLockManager(redisTemplate);
    }

    @Bean
    public CacheStampedeAspect cacheStampedeAspect(
            CacheManager cacheManager,
            RedisDistributedLockManager lockManager) {
        return new CacheStampedeAspect(cacheManager, lockManager);
    }

    @Target(ElementType.METHOD)
    @Retention(RetentionPolicy.RUNTIME)
    public @interface CacheableWithLock {
        String cacheName();
        String key();
        long lockTimeoutSeconds() default 5;
        long expireSeconds() default 600;
    }

    public static class RedisDistributedLockManager {

        private final RedisTemplate<String, Object> redisTemplate;
        private static final String LOCK_SCRIPT = 
                "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                "return redis.call('del', KEYS[1]) else return 0 end";

        public RedisDistributedLockManager(RedisTemplate<String, Object> redisTemplate) {
            this.redisTemplate = redisTemplate;
        }

        public boolean acquireLock(String lockKey, String lockValue, long expireSeconds) {
            Boolean success = redisTemplate.opsForValue()
                    .setIfAbsent("lock:" + lockKey, lockValue, Duration.ofSeconds(expireSeconds));
            return Boolean.TRUE.equals(success);
        }

        public boolean releaseLock(String lockKey, String lockValue) {
            RedisScript<Long> script = new DefaultRedisScript<>(LOCK_SCRIPT, Long.class);
            Long result = redisTemplate.execute(script, Collections.singletonList("lock:" + lockKey), lockValue);
            return Long.valueOf(1L).equals(result);
        }

        private static final String RENEW_SCRIPT =
                "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                "return redis.call('expire', KEYS[1], ARGV[2]) else return 0 end";

        public boolean renewLock(String lockKey, String lockValue, long expireSeconds) {
            RedisScript<Long> script = new DefaultRedisScript<>(RENEW_SCRIPT, Long.class);
            Long result = redisTemplate.execute(script, Collections.singletonList("lock:" + lockKey),
                    lockValue, String.valueOf(expireSeconds));
            return Long.valueOf(1L).equals(result);
        }
    }

    @Aspect
    @Component
    public static class CacheStampedeAspect {

        private static final Logger log = LoggerFactory.getLogger(CacheStampedeAspect.class);
        private final CacheManager cacheManager;
        private final RedisDistributedLockManager lockManager;

        public CacheStampedeAspect(CacheManager cacheManager, RedisDistributedLockManager lockManager) {
            this.cacheManager = cacheManager;
            this.lockManager = lockManager;
        }

        private static final long STAMPEDE_WAIT_MILLIS = 2000;
        private static final long STAMPEDE_POLL_MILLIS = 50;

        @Around("@annotation(cacheableWithLock)")
        public Object protectAgainstStampede(ProceedingJoinPoint pjp, CacheableWithLock cacheableWithLock) throws Throwable {
            Cache cache = cacheManager.getCache(cacheableWithLock.cacheName());
            String evaluatedKey = parseKey(pjp, cacheableWithLock.key());

            if (cache != null) {
                Cache.ValueWrapper valueWrapper = cache.get(evaluatedKey);
                if (valueWrapper != null) {
                    return valueWrapper.get();
                }
            }

            String lockKey = cacheableWithLock.cacheName() + ":" + evaluatedKey;
            long lockTimeoutSeconds = cacheableWithLock.lockTimeoutSeconds();
            String lockValue = java.util.UUID.randomUUID().toString();

            if (lockManager.acquireLock(lockKey, lockValue, lockTimeoutSeconds)) {
                return computeAndCache(pjp, cache, lockKey, evaluatedKey, lockValue, lockTimeoutSeconds);
            }

            // Contended: another thread already holds the lock. Wait for it to populate
            // the cache, then serve the value from cache. If the cache stays cold (e.g.
            // the holder failed), acquire the lock ourselves and compute so the result is
            // cached and the stampede is actually prevented.
            long deadline = System.currentTimeMillis() + STAMPEDE_WAIT_MILLIS;
            while (System.currentTimeMillis() < deadline) {
                Thread.sleep(STAMPEDE_POLL_MILLIS);
                if (cache != null) {
                    Cache.ValueWrapper valueWrapper = cache.get(evaluatedKey);
                    if (valueWrapper != null) {
                        return valueWrapper.get();
                    }
                }
            }

            String retryLockValue = java.util.UUID.randomUUID().toString();
            if (lockManager.acquireLock(lockKey, retryLockValue, lockTimeoutSeconds)) {
                return computeAndCache(pjp, cache, lockKey, evaluatedKey, retryLockValue, lockTimeoutSeconds);
            }

            // Could not acquire the lock (holder still computing past the wait window).
            // Compute without caching to avoid an indefinite stall.
            log.warn("Stampede lock could not be acquired for key: {}. Computing without caching.", lockKey);
            return pjp.proceed();
        }

        private Object computeAndCache(ProceedingJoinPoint pjp, Cache cache, String lockKey,
                                       String evaluatedKey, String lockValue, long lockTimeoutSeconds) throws Throwable {
            LockWatchdog watchdog = new LockWatchdog(lockManager, lockKey, lockValue, lockTimeoutSeconds);
            try {
                watchdog.start();
                log.debug("Lock acquired for key: {}. Computing database value...", lockKey);
                Object result = pjp.proceed();
                if (cache != null && result != null) {
                    cache.put(evaluatedKey, result);
                }
                return result;
            } finally {
                watchdog.stop();
                lockManager.releaseLock(lockKey, lockValue);
            }
        }

        private String parseKey(ProceedingJoinPoint pjp, String keyExpression) {
            if (keyExpression.startsWith("#")) {
                MethodSignature signature = (MethodSignature) pjp.getSignature();
                String[] paramNames = signature.getParameterNames();
                Object[] args = pjp.getArgs();
                String targetParam = keyExpression.substring(1);
                for (int i = 0; i < paramNames.length; i++) {
                    if (paramNames[i].equals(targetParam)) {
                        return args[i].toString();
                    }
                }
            }
            return keyExpression;
        }

        /**
         * Renews the distributed lock lease on a fixed cadence (a fraction of the TTL)
         * while the holder is still computing, so a slow computation cannot lose the
         * lock to a second thread before it finishes and populates the cache.
         */
        private static class LockWatchdog {
            private final RedisDistributedLockManager lockManager;
            private final String lockKey;
            private final String lockValue;
            private final long expireSeconds;
            private final Thread thread;
            private volatile boolean running = true;

            LockWatchdog(RedisDistributedLockManager lockManager, String lockKey, String lockValue, long expireSeconds) {
                this.lockManager = lockManager;
                this.lockKey = lockKey;
                this.lockValue = lockValue;
                this.expireSeconds = expireSeconds;
                this.thread = new Thread(this::run, "cache-lock-watchdog");
                this.thread.setDaemon(true);
            }

            void start() {
                thread.start();
            }

            void stop() {
                running = false;
                thread.interrupt();
            }

            private void run() {
                long intervalMillis = Math.max(200, TimeUnit.SECONDS.toMillis(expireSeconds) / 3);
                while (running) {
                    try {
                        Thread.sleep(intervalMillis);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                    if (!running) {
                        return;
                    }
                    lockManager.renewLock(lockKey, lockValue, expireSeconds);
                }
            }
        }
    }

    // ============================================================================================
    // 7. REDIS SLIDING WINDOW RATE LIMITER ENGINE
    // ============================================================================================

    @Bean
    public RedisSlidingWindowRateLimiter rateLimiter(RedisTemplate<String, Object> redisTemplate) {
        return new RedisSlidingWindowRateLimiter(redisTemplate);
    }

    public static class RedisSlidingWindowRateLimiter {

        private final RedisTemplate<String, Object> redisTemplate;
        
        private static final String RATE_LIMIT_LUA =
                "local key = KEYS[1]\n" +
                "local now = tonumber(ARGV[1])\n" +
                "local window = tonumber(ARGV[2])\n" +
                "local limit = tonumber(ARGV[3])\n" +
                "local clearBefore = now - window\n" +
                "redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)\n" +
                "local currentRequests = redis.call('ZCARD', key)\n" +
                "if currentRequests < limit then\n" +
                "    redis.call('ZADD', key, now, now)\n" +
                "    redis.call('EXPIRE', key, math.ceil(window / 1000))\n" +
                "    return 1\n" +
                "else\n" +
                "    return 0\n" +
                "end";

        public RedisSlidingWindowRateLimiter(RedisTemplate<String, Object> redisTemplate) {
            this.redisTemplate = redisTemplate;
        }

        public boolean isAllowed(String apiKey, int maxRequests, long windowMs) {
            String redisKey = "ratelimit:" + apiKey;
            long now = System.currentTimeMillis();

            RedisScript<Long> script = new DefaultRedisScript<>(RATE_LIMIT_LUA, Long.class);
            Long result = redisTemplate.execute(
                    script,
                    Collections.singletonList(redisKey),
                    String.valueOf(now),
                    String.valueOf(windowMs),
                    String.valueOf(maxRequests)
            );

            return Long.valueOf(1L).equals(result);
        }
    }

    // ============================================================================================
    // 8. DISTRIBUTED PUB/SUB MULTI-NODE CACHE INVALIDATION
    // ============================================================================================

    @Bean
    public MessageListenerAdapter invalidationListenerAdapter(CacheInvalidationSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "handleInvalidation");
    }

    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter invalidationListenerAdapter) {

        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(invalidationListenerAdapter, new ChannelTopic(INVALIDATION_TOPIC));
        return container;
    }

    public static record CacheInvalidationMessage(String cacheName, String key, String originNodeId) implements Serializable {}

    @Service
    public static class CacheInvalidationPublisher {

        private final RedisTemplate<String, CacheInvalidationMessage> invalidationRedisTemplate;
        @Value("${server.node-id:node-1}")
        private String nodeId;

        public CacheInvalidationPublisher(RedisTemplate<String, CacheInvalidationMessage> invalidationRedisTemplate) {
            this.invalidationRedisTemplate = invalidationRedisTemplate;
        }

        public void publishEviction(String cacheName, String key) {
            CacheInvalidationMessage message = new CacheInvalidationMessage(cacheName, key, nodeId);
            invalidationRedisTemplate.convertAndSend(INVALIDATION_TOPIC, message);
        }
    }

    @Component
    public static class CacheInvalidationSubscriber {

        private static final Logger log = LoggerFactory.getLogger(CacheInvalidationSubscriber.class);
        private final CacheManager cacheManager;
        
        @Value("${server.node-id:node-1}")
        private String nodeId;

        public CacheInvalidationSubscriber(CacheManager cacheManager) {
            this.cacheManager = cacheManager;
        }

        public void handleInvalidation(CacheInvalidationMessage message) {
            if (nodeId.equals(message.originNodeId())) {
                return; // Ignore self-published events
            }

            log.info("Received cache eviction message from Node [{}] for cache [{}] with key [{}]",
                    message.originNodeId(), message.cacheName(), message.key());

            Cache cache = cacheManager.getCache(message.cacheName());
            if (cache != null) {
                if (StringUtils.hasText(message.key())) {
                    cache.evict(message.key());
                } else {
                    cache.clear();
                }
            }
        }
    }

    // ============================================================================================
    // 9. METRICS & OBSERVABILITY (MICROMETER BINDER)
    // ============================================================================================

    @Component
    public static class RedisCacheMetricsBinder {

        public RedisCacheMetricsBinder(CacheManager cacheManager, MeterRegistry meterRegistry) {
            if (cacheManager instanceof RedisCacheManager redisCacheManager) {
                redisCacheManager.getCacheNames().forEach(cacheName -> {
                    Cache cache = redisCacheManager.getCache(cacheName);
                    if (cache != null) {
                        new CacheMeterBinder(
                                new MicrometerCacheAdapter(cache),
                                cacheName,
                                List.of(Tag.of("type", "redis"), Tag.of("app", "eventra-backend"))
                        ).bindTo(meterRegistry);
                    }
                });
            }
        }

        private static class MicrometerCacheAdapter implements io.micrometer.core.instrument.binder.cache.CacheMeterBinderProvider<Cache> {
            private final Cache cache;

            public MicrometerCacheAdapter(Cache cache) {
                this.cache = cache;
            }

            @Override
            public io.micrometer.core.instrument.binder.cache.CacheMeterBinder getMeterBinder(Cache cache, Iterable<Tag> tags) {
                return new CacheMeterBinder(cache, cache.getName(), tags);
            }
        }
    }

    // ============================================================================================
    // 10. HEALTH CHECK & MANAGEMENT SERVICE
    // ============================================================================================

    @Component("redisCustomHealthIndicator")
    public static class RedisHealthCheck implements HealthIndicator {

        private final RedisTemplate<String, Object> redisTemplate;

        public RedisHealthCheck(RedisTemplate<String, Object> redisTemplate) {
            this.redisTemplate = redisTemplate;
        }

        @Override
        public Health health() {
            try {
                RedisConnection connection = Objects.requireNonNull(redisTemplate.getConnectionFactory()).getConnection();
                String pingResponse = connection.ping();
                PropertiesInfo info = parseInfo(connection.info("memory"));
                connection.close();

                return Health.up()
                        .withDetail("ping", pingResponse)
                        .withDetail("used_memory_human", info.usedMemoryHuman)
                        .withDetail("connected_clients", info.connectedClients)
                        .build();
            } catch (Exception e) {
                return Health.down(e)
                        .withDetail("error", "Redis unreachable: " + e.getMessage())
                        .build();
            }
        }

        private PropertiesInfo parseInfo(java.util.Properties properties) {
            PropertiesInfo info = new PropertiesInfo();
            if (properties != null) {
                info.usedMemoryHuman = properties.getProperty("used_memory_human", "N/A");
                info.connectedClients = properties.getProperty("connected_clients", "N/A");
            }
            return info;
        }

        private static class PropertiesInfo {
            String usedMemoryHuman = "N/A";
            String connectedClients = "N/A";
        }
    }

    @Service
    public static class RedisCacheAdminService {

        private static final Logger log = LoggerFactory.getLogger(RedisCacheAdminService.class);
        private final CacheManager cacheManager;
        private final RedisTemplate<String, Object> redisTemplate;

        public RedisCacheAdminService(CacheManager cacheManager, RedisTemplate<String, Object> redisTemplate) {
            this.cacheManager = cacheManager;
            this.redisTemplate = redisTemplate;
        }

        public void clearAllCaches() {
            log.warn("ADMIN ACTION: Clearing all application Redis caches!");
            cacheManager.getCacheNames().forEach(name -> {
                Cache cache = cacheManager.getCache(name);
                if (cache != null) cache.clear();
            });
        }

        public Map<String, Object> getCacheStats() {
            Map<String, Object> stats = new ConcurrentHashMap<>();
            cacheManager.getCacheNames().forEach(cacheName -> {
                Set<String> keys = redisTemplate.keys("eventra:" + cacheName + ":*");
                stats.put(cacheName, Map.of(
                        "activeKeysCount", keys != null ? keys.size() : 0,
                        "status", "ACTIVE"
                ));
            });
            return stats;
        }
    }

    // ============================================================================================
    // 11. CONFIGURATION PROPERTIES BINDING
    // ============================================================================================

    @ConfigurationProperties(prefix = "eventra.cache")
    public static class CacheCustomProperties {

        private long defaultTtlMinutes = 10;
        private String keyPrefix = "eventra";
        private boolean cacheNullValues = false;

        public long getDefaultTtlMinutes() {
            return defaultTtlMinutes;
        }

        public void setDefaultTtlMinutes(long defaultTtlMinutes) {
            this.defaultTtlMinutes = defaultTtlMinutes;
        }

        public String getKeyPrefix() {
            return keyPrefix;
        }

        public void setKeyPrefix(String keyPrefix) {
            this.keyPrefix = keyPrefix;
        }

        public boolean isCacheNullValues() {
            return cacheNullValues;
        }

        public void setCacheNullValues(boolean cacheNullValues) {
            this.cacheNullValues = cacheNullValues;
        }
    }
}