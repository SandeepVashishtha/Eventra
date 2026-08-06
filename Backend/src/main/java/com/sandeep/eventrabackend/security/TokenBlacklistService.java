package com.sandeep.eventrabackend.security;

import com.sandeep.eventrabackend.model.BlacklistedToken;
import com.sandeep.eventrabackend.repository.TokenBlacklistRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    // Fast-path cache: token hash -> expiration. The database is the source
    // of truth so revoked tokens survive restarts and multi-instance setups.
    private final Map<String, Date> blacklist = new ConcurrentHashMap<>();

    private final TokenBlacklistRepository tokenBlacklistRepository;

    public TokenBlacklistService(TokenBlacklistRepository tokenBlacklistRepository) {
        this.tokenBlacklistRepository = tokenBlacklistRepository;
    }

    @Transactional
    public void addToBlacklist(String token, Date expiration) {
        String tokenHash = hash(token);
        blacklist.put(tokenHash, expiration);
        tokenBlacklistRepository.save(BlacklistedToken.builder()
                .tokenHash(tokenHash)
                .expiresAt(expiration.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime())
                .build());
    }

    public boolean isBlacklisted(String token) {
        String tokenHash = hash(token);
        Date expiration = blacklist.get(tokenHash);
        if (expiration != null && expiration.after(new Date())) {
            return true;
        }
        return tokenBlacklistRepository.existsByTokenHash(tokenHash);
    }

    /**
     * Clears the blacklist (in-memory and database).
     * Primarily used for test isolation.
     */
    @Transactional
    public void clear() {
        blacklist.clear();
        tokenBlacklistRepository.deleteAll();
    }

    // Clean up expired tokens every hour to prevent the store from growing
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanUpBlacklist() {
        blacklist.clear();
        tokenBlacklistRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                sb.append(Character.forDigit((b >> 4) & 0xF, 16));
                sb.append(Character.forDigit(b & 0xF, 16));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 message digest is not available", e);
        }
    }
}
