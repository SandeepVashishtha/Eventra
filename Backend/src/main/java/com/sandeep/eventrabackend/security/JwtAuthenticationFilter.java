package com.sandeep.eventrabackend.security;

import com.sandeep.eventrabackend.model.User;
import com.sandeep.eventrabackend.repository.UserRepository;
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
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;
    private final AuthCookieHelper authCookieHelper;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                   UserDetailsService userDetailsService,
                                   TokenBlacklistService tokenBlacklistService,
                                   UserRepository userRepository,
                                   AuthCookieHelper authCookieHelper) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.userRepository = userRepository;
        this.authCookieHelper = authCookieHelper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = extractTokenFromRequest(request);

            if (StringUtils.hasText(token) && tokenBlacklistService.isBlacklisted(token)) {
                logger.warn("Attempt to use blacklisted token.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token has been revoked/logged out");
                return;
            }

            if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
                if (!jwtTokenProvider.isAccessToken(token)) {
                    logger.warn("Rejected non-access JWT on API request");
                    filterChain.doFilter(request, response);
                    return;
                }
                String username = jwtTokenProvider.getUsernameFromToken(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                Date tokenIssuedAt = jwtTokenProvider.getIssuedAtDateFromToken(token);
                Optional<User> userOpt = userRepository.findByEmail(username);
                if (userOpt.isPresent() && userOpt.get().getPasswordChangedAt() != null) {
                    long tokenIssuedSec = tokenIssuedAt.getTime() / 1000;
                    long passwordChangedSec = userOpt.get().getPasswordChangedAt()
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
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        // Browser sessions: HttpOnly cookie set on login/signup/google
        return authCookieHelper.extractToken(request);
    }
}