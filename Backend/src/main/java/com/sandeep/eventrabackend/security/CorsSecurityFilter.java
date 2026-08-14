package com.sandeep.eventrabackend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class CorsSecurityFilter extends OncePerRequestFilter {

    private final CorsProperties corsProperties;

    public CorsSecurityFilter(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String origin = request.getHeader("Origin");

        if (origin != null) {
            boolean allowed = corsProperties.getAllowedOrigins().contains(origin);
            if (allowed) {
                response.setHeader("Access-Control-Allow-Origin", origin);
                response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                response.setHeader("Access-Control-Allow-Headers", "*");
                response.setHeader("Access-Control-Allow-Credentials", "true");
            } else {
                response.setStatus(403);
                response.getWriter().write("Forbidden - CORS origin disallowed");
                return;
            }
        }

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(200);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
