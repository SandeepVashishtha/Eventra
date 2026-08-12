package com.sandeep.eventrabackend.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final SlidingWindowRateLimiter rateLimiter;

    public RateLimitInterceptor(SlidingWindowRateLimiter rateLimiter) {
        this.rateLimiter = rateLimiter;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String ipAddress = request.getRemoteAddr();
        String clientKey = "rate_limit_ip_" + ipAddress;

        // Apply rules: 60 requests per 60 seconds
        int limit = 60;
        boolean allowed = rateLimiter.isAllowed(clientKey, limit, 60);

        response.setHeader("X-RateLimit-Limit", String.valueOf(limit));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(rateLimiter.getRemainingRequests(clientKey, limit)));

        if (!allowed) {
            response.setStatus(429); // Too Many Requests
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
            return false;
        }

        return true;
    }
}
