package com.sandeep.eventrabackend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;

/**
 * Issues and clears the HttpOnly auth cookie that carries the JWT for browser
 * sessions. The cookie name must stay in sync with the frontend's
 * cookie-managed session path ({@code withCredentials: true}).
 */
@Component
public class AuthCookieHelper {

    public static final String COOKIE_NAME = "token";

    private final long jwtExpirationMs;
    private final boolean secureCookies;

    public AuthCookieHelper(
            @Value("${app.jwt.expiration-ms}") long jwtExpirationMs,
            @Value("${app.auth.cookie.secure:true}") boolean secureCookies) {
        this.jwtExpirationMs = jwtExpirationMs;
        this.secureCookies = secureCookies;
    }

    public ResponseCookie createAuthCookie(String jwt) {
        return baseCookie(jwt)
                .maxAge(Duration.ofMillis(jwtExpirationMs))
                .build();
    }

    public ResponseCookie clearAuthCookie() {
        return baseCookie("")
                .maxAge(Duration.ZERO)
                .build();
    }

    public String extractToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                String value = cookie.getValue();
                return (value == null || value.isBlank()) ? null : value;
            }
        }
        return null;
    }

    public void apply(HttpHeaders headers, ResponseCookie cookie) {
        headers.add(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private ResponseCookie.ResponseCookieBuilder baseCookie(String value) {
        // SameSite=None is required for cross-site SPA → API calls (Vercel ↔ Azure).
        // Browsers require Secure with None; fall back to Lax for local HTTP/test.
        String sameSite = secureCookies ? "None" : "Lax";
        return ResponseCookie.from(COOKIE_NAME, value)
                .httpOnly(true)
                .secure(secureCookies)
                .path("/")
                .sameSite(sameSite);
    }
}
