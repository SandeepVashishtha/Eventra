package com.sandeep.eventrabackend.security;

import com.sandeep.eventrabackend.model.BlacklistedToken;
import com.sandeep.eventrabackend.repository.BlacklistedTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import java.util.HexFormat;

/**
 * Persists revoked JWTs so logout survives process restarts and works across
 * multiple app instances (replaces the old in-memory ConcurrentHashMap).
 */
@Service
public class TokenBlacklistService {

    private final BlacklistedTokenRepository blacklistedTokenRepository;

    public TokenBlacklistService(BlacklistedTokenRepository blacklistedTokenRepository) {
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    @Transactional
    public void addToBlacklist(String token, Date expiration) {
        if (token == null || token.isBlank() || expiration == null) {
            return;
        }
        Instant expiresAt = expiration.toInstant();
        if (expiresAt.isBefore(Instant.now())) {
            return;
        }
        blacklistedTokenRepository.save(new BlacklistedToken(hashToken(token), expiresAt));
    }

    @Transactional(readOnly = true)
    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        return blacklistedTokenRepository.existsByTokenHashAndExpiresAtAfter(
                hashToken(token), Instant.now());
    }

    /**
     * Clears the entire blacklist. Primarily used for test isolation.
     */
    @Transactional
    public void clear() {
        blacklistedTokenRepository.deleteAll();
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanUpBlacklist() {
        blacklistedTokenRepository.deleteExpired(Instant.now());
    }

    static String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
