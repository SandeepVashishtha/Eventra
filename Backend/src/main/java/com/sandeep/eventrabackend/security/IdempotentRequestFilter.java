package com.sandeep.eventrabackend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Component
public class IdempotentRequestFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;

    public IdempotentRequestFilter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String key = request.getHeader("Idempotency-Key");

        if (key != null && !key.trim().isEmpty()) {
            String redisKey = "idempotency:" + key;
            Boolean isNew = redisTemplate.opsForValue().setIfAbsent(redisKey, "IN_PROGRESS", 10, TimeUnit.MINUTES);

            if (isNew == null || !isNew) {
                response.setStatus(409);
                response.getWriter().write("Conflict - Request execution in progress or already completed");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
