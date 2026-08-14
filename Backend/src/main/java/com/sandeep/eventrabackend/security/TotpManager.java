package com.sandeep.eventrabackend.security;

import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Security-hardened TOTP Manager holding keys securely (#16505).
 */
@Component
public class TotpManager {

    private static final int TIME_STEP_SECONDS = 30;
    private static final int CODE_DIGITS = 6;
    private static final int CODE_MODULO = (int) Math.pow(10, CODE_DIGITS);
    private static final int VERIFY_WINDOW = 1;

    private final SecureRandom secureRandom = new SecureRandom();

    public String generateSecret() {
        byte[] buffer = new byte[20];
        secureRandom.nextBytes(buffer);
        return Base64.getEncoder().encodeToString(buffer);
    }

    /**
     * Verify a TOTP code against the given secret with a {@value #VERIFY_WINDOW}-step
     * window and constant-time comparison.
     */
    public boolean verifyToken(String secret, int code) {
        if (secret == null) return false;
        long currentStep = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;
        for (long step = currentStep - VERIFY_WINDOW; step <= currentStep + VERIFY_WINDOW; step++) {
            int expected = generateTotp(secret, step);
            if (MessageDigest.isEqual(
                    String.valueOf(expected).getBytes(StandardCharsets.UTF_8),
                    String.valueOf(code).getBytes(StandardCharsets.UTF_8))) {
                return true;
            }
        }
        return false;
    }

    int generateTotp(String secret, long timeStep) {
        try {
            byte[] key = Base64.getDecoder().decode(secret);
            byte[] counter = new byte[8];
            for (int i = 7; i >= 0; i--) {
                counter[i] = (byte) (timeStep & 0xff);
                timeStep >>= 8;
            }
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(counter);
            int offset = hash[hash.length - 1] & 0x0f;
            int binary = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);
            return binary % CODE_MODULO;
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            return -1;
        }
    }
}
