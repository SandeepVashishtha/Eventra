package com.sandeep.eventrabackend.config;

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
import java.time.Duration;

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
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
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
            String lockValue = java.util.UUID.randomUUID().toString();
            boolean acquired = lockManager.acquireLock(lockKey, lockValue, cacheableWithLock.lockTimeoutSeconds());

            if (acquired) {
                try {
                    log.debug("Lock acquired for key: {}. Computing database value...", lockKey);
                    Object result = pjp.proceed();
                    if (cache != null && result != null) {
                        cache.put(evaluatedKey, result);
                    }
                    return result;
                } finally {
                    lockManager.releaseLock(lockKey, lockValue);
                }
            } else {
                log.warn("Lock contended for key: {}. Retrying cache retrieval...", lockKey);
                TimeUnit.MILLISECONDS.sleep(150);
                if (cache != null) {
                    Cache.ValueWrapper valueWrapper = cache.get(evaluatedKey);
                    if (valueWrapper != null) {
                        return valueWrapper.get();
                    }
                }
                return pjp.proceed();
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