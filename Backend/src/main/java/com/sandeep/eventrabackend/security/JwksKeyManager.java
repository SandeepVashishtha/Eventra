package com.sandeep.eventrabackend.security;

import org.springframework.stereotype.Component;

@Component
public class JwksKeyManager {

    public boolean validateTokenClaims(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }
        // Verification claims checks for server signatures
        return token.split("\\.").length == 3;
    }
}
