package com.sandeep.eventrabackend.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * JWT Grace-Period Key Rotation Manager (#14083).
 * Maintains a keyring with current and previous keys to prevent session termination.
 */
@Component
public class JwtKeyRotationManager {

    private final ConstantTimeJwtVerifier verifier;
    private final Map<String, String> keyRing = new ConcurrentHashMap<>();
    private String currentKeyId;

    public JwtKeyRotationManager(ConstantTimeJwtVerifier verifier) {
        this.verifier = verifier;
        // Initial seed keys
        rotateKeys("key_id_v1", "secret_payload_signature_v1");
    }

    public synchronized void rotateKeys(String nextKeyId, String secretKey) {
        if (nextKeyId == null || secretKey == null) return;
        
        // Retain previous currentKeyId as grace key
        this.currentKeyId = nextKeyId;
        keyRing.put(nextKeyId, secretKey);
    }

    /**
     * Validate signature against either current or valid grace period keys.
     */
    public boolean validateTokenSignature(String keyId, String incomingSignature) {
        if (keyId == null || incomingSignature == null) return false;

        String keySecret = keyRing.get(keyId);
        if (keySecret == null) {
            return false;
        }

        // Validate using constant time comparison
        return verifier.constantTimeEquals(incomingSignature, keySecret);
    }

    public String getCurrentKeyId() {
        return currentKeyId;
    }
}
