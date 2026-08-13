package com.sandeep.eventrabackend.ratelimit;

import com.sandeep.eventrabackend.config.RateLimitProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

/**
 * Differentiates SSE Heartbeat Reconnect Streams from REST API Rate Limit Buckets.
 */
@Component("sseRateLimitingFilter")
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;
    private final RateLimitProperties properties;
    private final int trustedProxyHops;

    public RateLimitingFilter(RateLimitService rateLimitService,
            RateLimitProperties properties,
            @Value("${app.rate-limit.trusted-proxy-hops:1}") int trustedProxyHops) {
        this.rateLimitService = rateLimitService;
        this.properties = properties;
        this.trustedProxyHops = Math.max(0, trustedProxyHops);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (!properties.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        String clientIp = getClientIp(request);

        // FIX (#13902): SSE stream reconnects use an isolated high-capacity bucket
        if (path != null && path.startsWith("/api/stream/")) {
            RateLimitResult result = rateLimitService.consume("sse-stream", clientIp, 1000, Duration.ofMinutes(1));
            if (!result.allowed()) {
                response.setStatus(429);
                response.setHeader("Retry-After", String.valueOf(result.retryAfterSeconds()));
                response.getWriter().write("Too many SSE reconnection pings.");
                return;
            }
            filterChain.doFilter(request, response);
            return;
        }

        // Standard REST API Rate Limiting Bucket
        RateLimitResult result = rateLimitService.consume("rest-api", clientIp, 100, Duration.ofMinutes(1));
        if (!result.allowed()) {
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(result.retryAfterSeconds()));
            response.getWriter().write("Rate limit exceeded. Please try again later.");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Resolve the originating client IP using {@code X-Forwarded-For} with a
     * known trusted hop count, falling back to {@code X-Real-IP} then
     * {@code getRemoteAddr()} (#16254). Proxies append the connecting peer on
     * the right; the client is the leftmost of the trusted suffix, so a
     * client-supplied left-hand spoof is ignored instead of being used as the
     * rate-limit bucket key.
     */
    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            String[] parts = forwarded.split(",");
            int clientIndex = Math.min(parts.length - 1,
                    Math.max(0, parts.length - trustedProxyHops));
            String candidate = parts[clientIndex].trim();
            if (StringUtils.hasText(candidate) && !"unknown".equalsIgnoreCase(candidate)) {
                return candidate;
            }
        }

        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }
}
