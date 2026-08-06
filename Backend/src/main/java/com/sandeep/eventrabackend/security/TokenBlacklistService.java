package com.sandeep.eventrabackend.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    // Key: JWT token, Value: Token expiration date
    private final Map<String, Date> blacklist = new ConcurrentHashMap<>();

    public void addToBlacklist(String token, Date expiration) {
        blacklist.put(token, expiration);
    }

    public boolean isBlacklisted(String token) {
        return blacklist.containsKey(token);
    }

    /**
     * Clears the entire blacklist.
     * Primarily used for test isolation.
     */
    public void clear() {
        blacklist.clear();
    }

    // Clean up expired tokens every hour to prevent memory leaks
    @Scheduled(fixedRate = 3600000)
    public void cleanUpBlacklist() {
        Date now = new Date();
        blacklist.entrySet().removeIf(entry -> entry.getValue().before(now));
    }
}