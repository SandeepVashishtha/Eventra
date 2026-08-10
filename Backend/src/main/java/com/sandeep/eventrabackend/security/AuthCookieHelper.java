package com.sandeep.eventrabackend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;

/**
 * Issues and clears HttpOnly auth cookies for browser sessions.
 * Access token cookie name must stay in sync with the frontend's
 * cookie-managed session path ({@code withCredentials: true}).
 * Refresh token is also HttpOnly so browser clients never read it from JS.
 */
@Component
public class AuthCookieHelper {

    public static final String COOKIE_NAME = "token";
    public static final String REFRESH_COOKIE_NAME = "refreshToken";

    private final long jwtExpirationMs;
    private final long refreshExpirationMs;
    private final boolean secureCookies;

    public AuthCookieHelper(
            @Value("${app.jwt.expiration-ms}") long jwtExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs,
            @Value("${app.auth.cookie.secure:true}") boolean secureCookies) {
        this.jwtExpirationMs = jwtExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
        this.secureCookies = secureCookies;
    }

    public ResponseCookie createAuthCookie(String jwt) {
        return baseCookie(COOKIE_NAME, jwt)
                .maxAge(Duration.ofMillis(jwtExpirationMs))
                .build();
    }

    public ResponseCookie clearAuthCookie() {
        return baseCookie(COOKIE_NAME, "")
                .maxAge(Duration.ZERO)
                .build();
    }

    public ResponseCookie createRefreshCookie(String refreshJwt) {
        return baseCookie(REFRESH_COOKIE_NAME, refreshJwt)
                .maxAge(Duration.ofMillis(refreshExpirationMs))
                .build();
    }

    public ResponseCookie clearRefreshCookie() {
        return baseCookie(REFRESH_COOKIE_NAME, "")
                .maxAge(Duration.ZERO)
                .build();
    }

    public String extractToken(HttpServletRequest request) {
        return extractCookie(request, COOKIE_NAME);
    }

    public String extractRefreshToken(HttpServletRequest request) {
        return extractCookie(request, REFRESH_COOKIE_NAME);
    }

    public void apply(HttpHeaders headers, ResponseCookie cookie) {
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String extractCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                String value = cookie.getValue();
                return (value == null || value.isBlank()) ? null : value;
            }
        }
        return null;
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String name, String value) {
        // SameSite=None is required for cross-site SPA → API calls (Vercel ↔ Azure).
        // Browsers require Secure with None; fall back to Lax for local HTTP/test.
        String sameSite = secureCookies ? "None" : "Lax";
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secureCookies)
                .path("/")
                .sameSite(sameSite);
    }
}
