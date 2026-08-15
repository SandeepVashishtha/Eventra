package com.sandeep.eventrabackend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuthCookieHelper authCookieHelper;
    private final TokenRefreshQueueHandler tokenRefreshQueueHandler;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                   UserDetailsService userDetailsService,
                                   TokenBlacklistService tokenBlacklistService,
                                   AuthCookieHelper authCookieHelper,
                                   TokenRefreshQueueHandler tokenRefreshQueueHandler) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.authCookieHelper = authCookieHelper;
        this.tokenRefreshQueueHandler = tokenRefreshQueueHandler;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String headerToken = extractHeaderToken(request);
            String cookieToken = authCookieHelper.extractToken(request);

            // Token confusion protection: when a token is supplied via BOTH the
            // Authorization header and the auth cookie, they must resolve to the
            // same principal. A mismatch means the request is ambiguous/forged.
            // An invalid/stale cookie is treated as absent and ignored so it never
            // blocks a request that carries a valid Bearer header.
            if (StringUtils.hasText(headerToken) && StringUtils.hasText(cookieToken)) {
                boolean headerValid = jwtTokenProvider.validateToken(headerToken);
                boolean cookieValid = jwtTokenProvider.validateToken(cookieToken);
                if (headerValid && cookieValid && !tokensResolveToSameUser(headerToken, cookieToken)) {
                    logger.warn("Rejected request with mismatched header/cookie JWT identities");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Conflicting token identities");
                    return;
                }
            }

            String token = StringUtils.hasText(headerToken) ? headerToken : cookieToken;

            if (StringUtils.hasText(token) && tokenBlacklistService.isBlacklisted(token)) {
                if (tokenRefreshQueueHandler != null && tokenRefreshQueueHandler.isWithinGracePeriod(token)) {
                    logger.info("Allowing grace-period token during concurrent refresh burst.");
                } else {
                    logger.warn("Attempt to use blacklisted token.");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Token has been revoked/logged out");
                    return;
                }
            }

            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
                if (!jwtTokenProvider.isAccessToken(token)) {
                    logger.warn("Rejected non-access JWT on API request");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Access token required");
                    return;
                }
                String username = jwtTokenProvider.getUsernameFromToken(token);
                // Single DB load: CustomUserDetails carries passwordChangedAt
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                Date tokenIssuedAt = jwtTokenProvider.getIssuedAtDateFromToken(token);
                LocalDateTime passwordChangedAt = null;
                if (userDetails instanceof CustomUserDetails customUserDetails) {
                    passwordChangedAt = customUserDetails.getPasswordChangedAt();
                }
                if (passwordChangedAt != null) {
                    long tokenIssuedSec = tokenIssuedAt.getTime() / 1000;
                    long passwordChangedSec = passwordChangedAt
                            .atZone(ZoneId.systemDefault())
                            .toEpochSecond();
                    if (tokenIssuedSec < passwordChangedSec) {
                        logger.warn("Token issued before password change for user: {}", username);
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("Token invalidated by password change");
                        return;
                    }
                }

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.warn("Could not authenticate from JWT token: {}", ex.getMessage());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Authentication failed");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String extractHeaderToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private boolean tokensResolveToSameUser(String token1, String token2) {
        if (!jwtTokenProvider.validateToken(token1) || !jwtTokenProvider.validateToken(token2)) {
            return false;
        }
        if (!jwtTokenProvider.isAccessToken(token1) || !jwtTokenProvider.isAccessToken(token2)) {
            return false;
        }
        String username1 = jwtTokenProvider.getUsernameFromToken(token1);
        String username2 = jwtTokenProvider.getUsernameFromToken(token2);
        return username1 != null && username1.equals(username2);
    }

    public boolean isTokenIssuedBeforePasswordUpdate(Date tokenIssuedAt, Date passwordUpdatedAt) {
        if (passwordUpdatedAt == null || tokenIssuedAt == null) {
            return false;
        }
        return tokenIssuedAt.before(passwordUpdatedAt);
    }
}
