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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Component("authRateLimitingFilter")
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final String POST = "POST";
    private static final String GET = "GET";
    private static final List<EndpointRule> ENDPOINT_RULES = List.of(
            new EndpointRule("login", POST, "/api/auth/login"),
            new EndpointRule("signup", POST, "/api/auth/signup"),
            new EndpointRule("google", POST, "/api/auth/google"),
            new EndpointRule("refresh", POST, "/api/auth/refresh"),
            new EndpointRule("forgotPassword", POST, "/api/auth/reset-password"),
            new EndpointRule("forgotPassword", POST, "/api/auth/reset-password/"),
            new EndpointRule("contact", POST, "/api/contact"),
            new EndpointRule("contact", POST, "/api/contact/"),
            new EndpointRule("contact", POST, "/api/contacts"),
            new EndpointRule("contact", POST, "/api/contacts/"),
            new EndpointRule("githubProxy", GET, "/api/github-proxy"),
            new EndpointRule("validate", GET, "/api/validate/email"),
            new EndpointRule("validate", GET, "/api/validate/username"),
            new EndpointRule("validate", GET, "/api/validate/phone")
    );

    private final RateLimitProperties properties;
    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;
    private final int trustedProxyHops;

    public RateLimitingFilter(RateLimitProperties properties,
            RateLimitService rateLimitService,
            ObjectMapper objectMapper,
            @Value("${app.rate-limit.trusted-proxy-hops:1}") int trustedProxyHops) {
        this.properties = properties;
        this.rateLimitService = rateLimitService;
        this.objectMapper = objectMapper;
        this.trustedProxyHops = Math.max(0, trustedProxyHops);
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
        String bucketKey = resolveBucketKey(request);
        RateLimitResult result = rateLimitService.consume(
                endpointRule.name(),
                bucketKey,
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
            case "google" -> properties.getGoogle();
            case "refresh" -> properties.getRefresh();
            case "forgotPassword" -> properties.getForgotPassword();
            case "contact" -> properties.getContact();
            case "githubProxy" -> properties.getGithubProxy();
            case "validate" -> properties.getValidate();
            default -> throw new IllegalArgumentException("Unknown rate limit endpoint: " + endpointName);
        };
    }

    private String resolveBucketKey(HttpServletRequest request) {
        String clientIp = resolveClientIp(request);
        String userKey = resolveAuthenticatedUserKey(request);
        if (userKey != null) {
            return userKey + "|" + clientIp;
        }
        return clientIp;
    }

    private String resolveAuthenticatedUserKey(HttpServletRequest request) {
        var authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal() == null
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        String name = authentication.getName();
        return StringUtils.hasText(name) ? "user:" + name.trim().toLowerCase() : null;
    }

    /**
     * Resolve the originating client IP using {@code X-Forwarded-For} with a
     * known trusted hop count (Azure/Vercel LB), falling back to {@code X-Real-IP}
     * then {@link HttpServletRequest#getRemoteAddr()}.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            String[] parts = forwarded.split(",");
            // Proxies append the connecting peer on the right. Trust the rightmost
            // N entries as infrastructure; the client is the entry that is N
            // positions to the left of the rightmost (ignoring any client-supplied
            // left-hand spoof).
            // hops=1 on "client, proxy" (length 2) → index 0 = client.
            int clientIndex = Math.max(0, parts.length - 1 - trustedProxyHops);
            String candidate = parts[clientIndex].trim();
            if (StringUtils.hasText(candidate) && !"unknown".equalsIgnoreCase(candidate)) {
                return candidate;
            }
        }

        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return realIp.trim();
        }

        String remote = request.getRemoteAddr();
        return StringUtils.hasText(remote) ? remote : "unknown";
    }

    private record EndpointRule(String name, String method, String path) {
    }
}
