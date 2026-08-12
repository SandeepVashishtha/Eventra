package com.sandeep.eventrabackend.security;

import org.springframework.stereotype.Component;

import java.security.MessageDigest;

/**
 * Constant-Time String/Byte Verifier (#14083).
 * Prevents cryptographic timing side-channel attacks on signatures.
 */
@Component
public class ConstantTimeJwtVerifier {

    /**
     * Compare two signature strings in constant-time.
     */
    public boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) {
            return false;
        }

        byte[] aBytes = a.getBytes();
        byte[] bBytes = b.getBytes();

        return MessageDigest.isEqual(aBytes, bBytes);
    }
}
