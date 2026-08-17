package com.sandeep.eventrabackend.ratelimit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RedisTokenBucketLimiter limiter;

    public RateLimitFilter(RedisTokenBucketLimiter limiter) {
        this.limiter = limiter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String ip = request.getRemoteAddr();
        // Limit to 100 requests per minute
        boolean allowed = limiter.isAllowed(ip, 100);

        if (!allowed) {
            response.setStatus(429);
            response.getWriter().write("Too Many Requests - Rate limit exceeded");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
