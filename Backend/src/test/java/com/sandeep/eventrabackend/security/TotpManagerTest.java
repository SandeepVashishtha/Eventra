package com.sandeep.eventrabackend.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

/**
 * Regression coverage for #17838: {@link TotpManager#verifyToken} must not
 * accept arbitrary codes.
 */
class TotpManagerTest {

    private final TotpManager totpManager = new TotpManager();

    @Test
    void nullSecretIsRejected() {
        assertFalse(totpManager.verifyToken(null, 123456));
    }

    @Test
    void malformedSecretIsRejected() {
        assertFalse(totpManager.verifyToken("not-base64!", 123456));
    }

    @Test
    void wrongCodeIsRejected() {
        String secret = totpManager.generateSecret();
        long currentStep = System.currentTimeMillis() / 1000 / 30;
        int valid = totpManager.generateTotp(secret, currentStep);
        int wrong = (valid + 1) % 1000000;
        assertFalse(totpManager.verifyToken(secret, wrong));
    }

    @Test
    void validCodeForCurrentStepIsAccepted() {
        String secret = totpManager.generateSecret();
        long currentStep = System.currentTimeMillis() / 1000 / 30;
        assertTrue(totpManager.verifyToken(secret, totpManager.generateTotp(secret, currentStep)));
    }

    @Test
    void validCodeInAdjacentStepIsAccepted() {
        String secret = totpManager.generateSecret();
        long currentStep = System.currentTimeMillis() / 1000 / 30;
        assertTrue(totpManager.verifyToken(secret, totpManager.generateTotp(secret, currentStep + 1)));
    }
}
