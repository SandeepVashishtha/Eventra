package com.sandeep.eventrabackend.limiter;

import com.sandeep.eventrabackend.config.CacheConfig;
import com.sandeep.eventrabackend.config.FallbackLimiter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Integrated Rate-Limiting Protection Suite.
 *
 * <p>Contains the {@code @RateLimit} annotation, the {@link RateLimitAspect} for method-level
 * protection, and the {@link GlobalRateLimitingFilter} for HTTP Servlet boundary protection with
 * automatic failover to {@link FallbackLimiter} during Redis disruptions.
 */
public class RateLimiterProtectionSuite {

    // ============================================================================================
    // 1. ANNOTATION DEFINITIONS
    // ============================================================================================

    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface RateLimit {
        /** Rate limit key identifier or SpEL prefix. */
        String key() default "";

        /** Max requests allowed within the timeframe window. */
        int limit() default 60;

        /** Window frame duration in seconds. */
        long windowSeconds() default 60;

        /** Whether to fallback to local memory if Redis fails. */
        boolean fallbackToLocal() default true;

        /** Custom error message when rate limit is exceeded. */
        String message() default "Too many requests. Please try again later.";
    }

    public static class RateLimitExceededException extends RuntimeException {
        private final String clientKey;
        private final long retryAfterSeconds;

        public RateLimitExceededException(String message, String clientKey, long retryAfterSeconds) {
            super(message);
            this.clientKey = clientKey;
            this.retryAfterSeconds = retryAfterSeconds;
        }

        public String getClientKey() {
            return clientKey;
        }

        public long getRetryAfterSeconds() {
            return retryAfterSeconds;
        }
    }

    // ============================================================================================
    // 2. ASPECTJ METHOD-LEVEL RATE LIMITING ASPECT
    // ============================================================================================

    @Aspect
    @Component
    @Order(1)
    public static class RateLimitAspect {

        private static final Logger log = LoggerFactory.getLogger(RateLimitAspect.class);

        private final CacheConfig.RedisSlidingWindowRateLimiter redisRateLimiter;
        private final FallbackLimiter fallbackLimiter;

        @Value("${eventra.limiter.prefer-redis:true}")
        private boolean preferRedis;

        public RateLimitAspect(
                CacheConfig.RedisSlidingWindowRateLimiter redisRateLimiter,
                FallbackLimiter fallbackLimiter) {
            this.redisRateLimiter = redisRateLimiter;
            this.fallbackLimiter = fallbackLimiter;
        }

        @Around("@annotation(rateLimit)")
        public Object enforceRateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();

            String clientKey = resolveClientKey(joinPoint, rateLimit, method);
            int maxLimit = rateLimit.limit();
            long windowMs = rateLimit.windowSeconds() * 1000L;

            boolean allowed = false;

            if (preferRedis) {
                try {
                    allowed = redisRateLimiter.isAllowed(clientKey, maxLimit, windowMs);
                } catch (Exception e) {
                    log.warn("Primary Redis Rate Limiter failed for key [{}]: {}. Switching to FallbackLimiter.",
                            clientKey, e.getMessage());
                    
                    if (rateLimit.fallbackToLocal()) {
                        fallbackLimiter.setFallbackActive(true);
                        allowed = fallbackLimiter.isAllowedLocal(clientKey, maxLimit, windowMs);
                    } else {
                        // Fail open if fallback disabled for this endpoint
                        allowed = true;
                    }
                }
            } else {
                allowed = fallbackLimiter.isAllowedLocal(clientKey, maxLimit, windowMs);
            }

            if (!allowed) {
                log.warn("Rate limit exceeded for key [{}] on method [{}]", clientKey, method.getName());
                throw new RateLimitExceededException(
                        rateLimit.message(),
                        clientKey,
                        rateLimit.windowSeconds()
                );
            }

            return joinPoint.proceed();
        }

        private String resolveClientKey(ProceedingJoinPoint pjp, RateLimit rateLimit, Method method) {
            String baseKey = rateLimit.key();
            if (baseKey.isBlank()) {
                baseKey = pjp.getTarget().getClass().getSimpleName() + ":" + method.getName();
            }
            return "annotation_rl:" + baseKey;
        }
    }

    // ============================================================================================
    // 3. GLOBAL HTTP SERVLET FILTER
    // ============================================================================================

    @Component
    @Order(2)
    public static class GlobalRateLimitingFilter extends OncePerRequestFilter {

        private static final Logger log = LoggerFactory.getLogger(GlobalRateLimitingFilter.class);

        private final CacheConfig.RedisSlidingWindowRateLimiter redisRateLimiter;
        private final FallbackLimiter fallbackLimiter;

        @Value("${eventra.limiter.global.enabled:true}")
        private boolean globalLimiterEnabled;

        @Value("${eventra.limiter.global.ip-limit:300}")
        private int defaultIpLimit;

        @Value("${eventra.limiter.global.ip-window-seconds:60}")
        private long defaultIpWindowSeconds;

        private final Map<String, Integer> routeLimits = new ConcurrentHashMap<>();

        public GlobalRateLimitingFilter(
                CacheConfig.RedisSlidingWindowRateLimiter redisRateLimiter,
                FallbackLimiter fallbackLimiter) {
            this.redisRateLimiter = redisRateLimiter;
            this.fallbackLimiter = fallbackLimiter;
            
            // Route specific constraints
            routeLimits.put("/api/v1/auth/", 10);
            routeLimits.put("/api/v1/leaderboard", 60);
            routeLimits.put("/api/v1/events", 120);
        }

        @Override
        protected boolean shouldNotFilter(HttpServletRequest request) {
            String path = request.getRequestURI();
            return !globalLimiterEnabled 
                    || path.startsWith("/actuator") 
                    || path.startsWith("/swagger-ui") 
                    || path.startsWith("/v3/api-docs");
        }

        @Override
        protected void doFilterInternal(
                HttpServletRequest request,
                HttpServletResponse response,
                FilterChain filterChain) throws ServletException, IOException {

            String clientIp = extractClientIp(request);
            String uri = request.getRequestURI();
            
            int limit = getLimitForUri(uri);
            long windowMs = defaultIpWindowSeconds * 1000L;
            String rateKey = "http_rl:" + clientIp + ":" + getRouteGroup(uri);

            boolean allowed = false;

            try {
                allowed = redisRateLimiter.isAllowed(rateKey, limit, windowMs);
            } catch (Exception e) {
                log.warn("Redis connectivity interrupted in HTTP Filter. Invoking local FallbackLimiter for IP: {}", clientIp);
                fallbackLimiter.setFallbackActive(true);
                allowed = fallbackLimiter.isAllowedLocal(rateKey, limit, windowMs);
            }

            if (!allowed) {
                writeTooManyRequestsResponse(response, clientIp, defaultIpWindowSeconds);
                return;
            }

            filterChain.doFilter(request, response);
        }

        private String extractClientIp(HttpServletRequest request) {
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isBlank()) {
                return xForwardedFor.split(",")[0].trim();
            }
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isBlank()) {
                return xRealIp.trim();
            }
            return request.getRemoteAddr();
        }

        private int getLimitForUri(String uri) {
            for (Map.Entry<String, Integer> entry : routeLimits.entrySet()) {
                if (uri.startsWith(entry.getKey())) {
                    return entry.getValue();
                }
            }
            return defaultIpLimit;
        }

        private String getRouteGroup(String uri) {
            if (uri.startsWith("/api/v1/auth")) return "auth";
            if (uri.startsWith("/api/v1/leaderboard")) return "leaderboard";
            return "general";
        }

        private void writeTooManyRequestsResponse(
                HttpServletResponse response,
                String clientIp,
                long retryAfterSeconds) throws IOException {
            
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setHeader("X-RateLimit-Reset", String.valueOf(Instant.now().getEpochSecond() + retryAfterSeconds));

            String jsonPayload = String.format(
                    "{\"status\":429,\"error\":\"Too Many Requests\"," +
                    "\"message\":\"Rate limit exceeded for IP %s. Try again in %d seconds.\"," +
                    "\"timestamp\":\"%s\"}",
                    clientIp, retryAfterSeconds, Instant.now().toString()
            );

            response.getWriter().write(jsonPayload);
        }
    }
}