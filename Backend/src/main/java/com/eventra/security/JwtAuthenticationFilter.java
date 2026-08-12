package com.eventra.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.logging.Logger;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = Logger.getLogger(JwtAuthenticationFilter.class.getName());

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Process JWT authentication token from Request Authorization header
            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException e) {
            logger.warning("JWT Access Token expired: " + e.getMessage());
            handleJwtException(response, "JWT access token has expired. Please re-authenticate.", HttpStatus.UNAUTHORIZED);
        } catch (JwtException e) {
            logger.warning("Invalid JWT Access Token: " + e.getMessage());
            handleJwtException(response, "Invalid JWT access token.", HttpStatus.UNAUTHORIZED);
        }
    }

    private void handleJwtException(HttpServletResponse response, String message, HttpStatus status) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(String.format("{\"status\": %d, \"error\": \"%s\", \"message\": \"%s\"}", 
                status.value(), status.getReasonPhrase(), message));
    }
}
