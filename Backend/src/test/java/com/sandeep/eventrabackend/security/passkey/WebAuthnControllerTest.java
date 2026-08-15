package com.sandeep.eventrabackend.security.passkey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;

import java.lang.reflect.Field;
import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for WebAuthnController challenge issuance/verification.
 * Verifies authentication is required, challenges are scoped to the principal,
 * single-use, expiring, and bounded (#16258).
 */
@ExtendWith(MockitoExtension.class)
class WebAuthnControllerTest {

    @Mock
    private PasskeyCredentialRepository credentialRepository;

    private WebAuthnController controller;

    @BeforeEach
    void setUp() {
        controller = new WebAuthnController(credentialRepository);
    }

    private Authentication auth(String username) {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn(username);
        return authentication;
    }

    @SuppressWarnings("unchecked")
    private Map<String, WebAuthnController.ChallengeEntry> challengeMap() throws Exception {
        Field field = WebAuthnController.class.getDeclaredField("pendingChallenges");
        field.setAccessible(true);
        return (Map<String, WebAuthnController.ChallengeEntry>) field.get(controller);
    }

    @Test
    @DisplayName("Challenge is issued for the authenticated principal")
    void challengeIsIssuedForPrincipal() {
        ResponseEntity<Map<String, Object>> response =
                controller.generateRegisterChallenge(auth("User@Example.com"));

        assertEquals(200, response.getStatusCode().value());
        assertEquals("User@Example.com", response.getBody().get("userEmail"));
        assertNotNull(response.getBody().get("challenge"));
    }

    @Test
    @DisplayName("Verifying an unissued challenge is rejected")
    void verifyingUnissuedChallengeIsRejected() {
        Map<String, String> payload = Map.of(
                "credentialId", "cred-1",
                "userEmail", "user@example.com",
                "publicKey", "-----BEGIN PUBLIC KEY-----MIIB-----END PUBLIC KEY-----",
                "challenge", "not-issued");

        assertThrows(IllegalArgumentException.class,
                () -> controller.verifyRegistration(payload, auth("user@example.com")));
    }

    @Test
    @DisplayName("Challenge is single-use after a successful verification")
    void challengeIsSingleUse() throws Exception {
        String challenge = (String) controller.generateRegisterChallenge(auth("user@example.com")).getBody().get("challenge");

        Map<String, String> payload = Map.of(
                "credentialId", "cred-1",
                "userEmail", "user@example.com",
                "publicKey", "-----BEGIN PUBLIC KEY-----MIIB-----END PUBLIC KEY-----",
                "challenge", challenge);

        assertEquals(200, controller.verifyRegistration(payload, auth("user@example.com")).getStatusCode().value());

        // Second use of the same challenge is rejected.
        assertThrows(IllegalArgumentException.class,
                () -> controller.verifyRegistration(payload, auth("user@example.com")));
    }

    @Test
    @DisplayName("Expired challenge is rejected even if it matches")
    void expiredChallengeIsRejected() throws Exception {
        Map<String, WebAuthnController.ChallengeEntry> map = challengeMap();
        map.put("user@example.com", new WebAuthnController.ChallengeEntry("stale", Instant.now().minusSeconds(601)));

        Map<String, String> payload = Map.of(
                "credentialId", "cred-1",
                "userEmail", "user@example.com",
                "publicKey", "-----BEGIN PUBLIC KEY-----MIIB-----END PUBLIC KEY-----",
                "challenge", "stale");

        assertThrows(IllegalArgumentException.class,
                () -> controller.verifyRegistration(payload, auth("user@example.com")));
    }

    @Test
    @DisplayName("Verifying another account's challenge is denied")
    void verifyingAnotherAccountChallengeIsDenied() {
        String challenge = (String) controller.generateRegisterChallenge(auth("owner@example.com")).getBody().get("challenge");

        Map<String, String> payload = Map.of(
                "credentialId", "cred-1",
                "userEmail", "victim@example.com",
                "publicKey", "-----BEGIN PUBLIC KEY-----MIIB-----END PUBLIC KEY-----",
                "challenge", challenge);

        assertThrows(AccessDeniedException.class,
                () -> controller.verifyRegistration(payload, auth("owner@example.com")));
    }

    @Test
    @DisplayName("Challenge store is bounded and rejects growth past the cap")
    void challengeStoreIsBounded() {
        int cap = 1000;
        for (int i = 0; i < cap; i++) {
            controller.generateRegisterChallenge(auth("user-" + i + "@example.com"));
        }

        assertThrows(IllegalArgumentException.class,
                () -> controller.generateRegisterChallenge(auth("user-extra@example.com")));
    }

    @Test
    @DisplayName("Successful verification persists the credential")
    void successfulVerificationPersistsCredential() {
        String challenge = (String) controller.generateRegisterChallenge(auth("user@example.com")).getBody().get("challenge");

        Map<String, String> payload = Map.of(
                "credentialId", "cred-1",
                "userEmail", "user@example.com",
                "publicKey", "-----BEGIN PUBLIC KEY-----MIIB-----END PUBLIC KEY-----",
                "challenge", challenge);

        controller.verifyRegistration(payload, auth("user@example.com"));

        verify(credentialRepository).save(any());
    }
}
