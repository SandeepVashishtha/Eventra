package com.sandeep.eventrabackend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);
    public static final String CLAIM_TOKEN_TYPE = "typ";
    public static final String TYPE_ACCESS = "access";
    public static final String TYPE_REFRESH = "refresh";

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long jwtRefreshExpirationMs;

    private SecretKey cachedSecretKey;

    @PostConstruct
    public void validateSecret() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException(
                    "JWT_SECRET environment variable is not set. " +
                    "Application cannot start without a valid JWT signing key. " +
                    "Generate one with: openssl rand -base64 32"
            );
        }
        if (jwtSecret.length() < 32) {
            logger.warn("JWT_SECRET is shorter than 32 characters. " +
                        "For production, use a 256-bit key: openssl rand -base64 32");
        }

        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtSecret);
        } catch (Exception ex) {
            keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        }
        this.cachedSecretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    private SecretKey getSigningKey() {
        return this.cachedSecretKey;
    }

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateToken(userPrincipal.getUsername());
    }

    public String generateToken(String username) {
        return buildToken(username, TYPE_ACCESS, jwtExpirationMs);
    }

    public String generateRefreshToken(String username) {
        return buildToken(username, TYPE_REFRESH, jwtRefreshExpirationMs);
    }

    private String buildToken(String subject, String type, long expirationMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(subject)
                .claim(CLAIM_TOKEN_TYPE, type)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public Date getExpirationDateFromToken(String token) {
        return parseClaims(token).getExpiration();
    }

    public Date getIssuedAtDateFromToken(String token) {
        return parseClaims(token).getIssuedAt();
    }

    public boolean isRefreshToken(String token) {
        Object type = parseClaims(token).get(CLAIM_TOKEN_TYPE);
        return TYPE_REFRESH.equals(type);
    }

    public boolean isAccessToken(String token) {
        Object type = parseClaims(token).get(CLAIM_TOKEN_TYPE);
        // Tokens minted before typ claim existed are treated as access tokens.
        return type == null || TYPE_ACCESS.equals(type);
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
