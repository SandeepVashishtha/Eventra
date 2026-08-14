package com.sandeep.eventrabackend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class OAuth2VerificationFilter extends OncePerRequestFilter {

    private final JwksKeyManager keyManager;

    public OAuth2VerificationFilter(JwksKeyManager keyManager) {
        this.keyManager = keyManager;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            boolean isValid = keyManager.validateTokenClaims(token);

            if (!isValid) {
                response.setStatus(401);
                response.getWriter().write("Unauthorized - Invalid Server-to-Server JWT token");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
