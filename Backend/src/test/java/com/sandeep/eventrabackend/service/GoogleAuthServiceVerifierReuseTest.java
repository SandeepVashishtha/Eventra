package com.sandeep.eventrabackend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;

class GoogleAuthServiceVerifierReuseTest {

    @Test
    @DisplayName("Reuses a single GoogleIdTokenVerifier instance across calls (#16238)")
    void verifyToken_ReusesSingletonVerifier() throws Exception {
        GoogleAuthService service = new GoogleAuthService();
        setField(service, "googleClientId", "test-client-id.apps.googleusercontent.com");

        GoogleIdTokenVerifier first = service.getVerifier();
        GoogleIdTokenVerifier second = service.getVerifier();

        assertNotNull(first);
        assertSame(first, second, "Expected the same verifier instance to be reused across calls");
    }

    private static void setField(Object target, String name, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(name);
        field.setAccessible(true);
        field.set(target, value);
    }
}
