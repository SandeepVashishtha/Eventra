package com.sandeep.eventrabackend.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Creates a bucket that allows exactly 15 requests every 1 minute
    private final Bucket bucket = Bucket.builder()
            .addLimit(Bandwidth.classic(15, Refill.intervally(15, Duration.ofMinutes(1))))
            .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // We only rate-limit authentication endpoints to prevent brute-force attacks
        if (requestURI.startsWith("/api/auth")) {
            if (!bucket.tryConsume(1)) {
                // If they are out of tokens, block the request and return a 429 error
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests. Please try again in a minute.");
                return;
            }
        }

        // If they have tokens (or are visiting a non-auth page), let the request through
        filterChain.doFilter(request, response);
    }
}