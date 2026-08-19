package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailVerificationService {

    private final ConcurrentHashMap<String, VerificationToken> tokenStore = new ConcurrentHashMap<>();

    public VerificationToken createToken(String userId) {
        String tokenVal = UUID.randomUUID().toString();
        VerificationToken token = new VerificationToken(tokenVal, userId, LocalDateTime.now().plusHours(24));
        tokenStore.put(tokenVal, token);
        return token;
    }

    public boolean verifyToken(String tokenVal) {
        VerificationToken token = tokenStore.get(tokenVal);
        if (token == null || token.isExpired()) {
            return false;
        }
        tokenStore.remove(tokenVal);
        return true;
    }
}
