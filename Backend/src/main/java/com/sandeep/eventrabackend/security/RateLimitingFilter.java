package com.sandeep.eventrabackend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sandeep.eventrabackend.config.RateLimitProperties;
import com.sandeep.eventrabackend.config.RateLimitProperties.EndpointLimit;
import com.sandeep.eventrabackend.dto.response.ErrorResponse;
import com.sandeep.eventrabackend.ratelimit.RateLimitResult;
import com.sandeep.eventrabackend.ratelimit.RateLimitService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final String POST = "POST";
    private static final List<EndpointRule> ENDPOINT_RULES = List.of(
            new EndpointRule("login", POST, "/api/auth/login"),
            new EndpointRule("signup", POST, "/api/auth/signup"),
            new EndpointRule("forgotPassword", POST, "/api/auth/forgot-password"),
            new EndpointRule("forgotPassword", POST, "/api/auth/forgot-password/"),
            new EndpointRule("contact", POST, "/api/contact"),
            new EndpointRule("contact", POST, "/api/contact/"),
            new EndpointRule("contact", POST, "/api/contacts"),
            new EndpointRule("contact", POST, "/api/contacts/")
    );

    private final RateLimitProperties properties;
    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    public RateLimitingFilter(RateLimitProperties properties,
            RateLimitService rateLimitService,
            ObjectMapper objectMapper) {
        this.properties = properties;
        this.rateLimitService = rateLimitService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {
        EndpointRule endpointRule = findEndpointRule(request);
        if (!properties.isEnabled() || endpointRule == null) {
            filterChain.doFilter(request, response);
            return;
        }

        EndpointLimit endpointLimit = limitFor(endpointRule.name());
        String clientIp = resolveClientIp(request);
        RateLimitResult result = rateLimitService.consume(
                endpointRule.name(),
                clientIp,
                endpointLimit.getCapacity(),
                endpointLimit.getWindow()
        );

        response.setHeader("X-RateLimit-Limit", String.valueOf(result.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.remaining()));

        if (result.allowed()) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(result.retryAfterSeconds()));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .error("Too Many Requests")
                .message("Rate limit exceeded. Please try again after "
                        + result.retryAfterSeconds() + " seconds.")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();

        objectMapper.writeValue(response.getWriter(), errorResponse);
    }

    private EndpointRule findEndpointRule(HttpServletRequest request) {
        String requestPath = request.getRequestURI();
        String method = request.getMethod();

        return ENDPOINT_RULES.stream()
                .filter(rule -> rule.method().equalsIgnoreCase(method))
                .filter(rule -> requestPath.equals(rule.path())
                        || requestPath.startsWith(rule.path() + "/"))
                .findFirst()
                .orElse(null);
    }

    private EndpointLimit limitFor(String endpointName) {
        return switch (endpointName) {
            case "login" -> properties.getLogin();
            case "signup" -> properties.getSignup();
            case "forgotPassword" -> properties.getForgotPassword();
            case "contact" -> properties.getContact();
            default -> throw new IllegalArgumentException("Unknown rate limit endpoint: " + endpointName);
        };
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor)) {
            String firstForwardedIp = forwardedFor.split(",")[0].trim();
            if (StringUtils.hasText(firstForwardedIp)) {
                return firstForwardedIp;
            }
        }

        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }

    private record EndpointRule(String name, String method, String path) {
    }
}
