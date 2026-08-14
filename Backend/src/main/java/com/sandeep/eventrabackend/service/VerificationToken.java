package com.sandeep.eventrabackend.service;

import java.time.LocalDateTime;

public class VerificationToken {
    private final String token;
    private final String userId;
    private final LocalDateTime expiryDate;

    public VerificationToken(String token, String userId, LocalDateTime expiryDate) {
        this.token = token;
        this.userId = userId;
        this.expiryDate = expiryDate;
    }

    public String getToken() {
        return token;
    }

    public String getUserId() {
        return userId;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}
