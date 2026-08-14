package com.sandeep.eventrabackend.security.passkey;

import com.webauthn4j.converter.util.ObjectConverter;
import com.webauthn4j.data.attestation.AttestationObject;
import com.webauthn4j.data.attestation.authenticator.AttestedCredentialData;
import com.webauthn4j.data.attestation.authenticator.AuthenticatorData;
import com.webauthn4j.data.attestation.authenticator.EC2COSEKey;
import com.webauthn4j.data.attestation.statement.COSEAlgorithmIdentifier;
import com.webauthn4j.data.attestation.statement.NoneAttestationStatement;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.ECPublicKey;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for WebAuthnController challenge issuance and attestation verification (#17865).
 */
@ExtendWith(MockitoExtension.class)
class WebAuthnControllerTest {

    @Mock
    private PasskeyCredentialRepository credentialRepository;

    private WebAuthnController controller;
    private ObjectConverter objectConverter = new ObjectConverter();

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

    private String createClientDataJSON(String challenge, String type) {
        String encodedChallenge = Base64.getUrlEncoder().withoutPadding().encodeToString(challenge.getBytes(StandardCharsets.UTF_8));
        String json = "{\"type\":\"" + type + "\",\"challenge\":\"" + encodedChallenge + "\",\"origin\":\"http://localhost\"}";
        return Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    private String createValidAttestationObject(String credentialId) throws Exception {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("EC");
        keyPairGenerator.initialize(256);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        ECPublicKey ecPublicKey = (ECPublicKey) keyPair.getPublic();

        byte[] rpIdHash = java.security.MessageDigest.getInstance("SHA-256").digest("localhost".getBytes(StandardCharsets.UTF_8));
        byte flags = (byte) 0x41; // User Present + Attested Credential Data
        long signCount = 0;

        byte[] xBytes = toFixed32Bytes(ecPublicKey.getW().getAffineX().toByteArray());
        byte[] yBytes = toFixed32Bytes(ecPublicKey.getW().getAffineY().toByteArray());

        EC2COSEKey coseKey = new EC2COSEKey(
                null,
                COSEAlgorithmIdentifier.ES256,
                null,
                com.webauthn4j.data.attestation.authenticator.Curve.SECP256R1,
                xBytes,
                yBytes
        );
        com.webauthn4j.data.attestation.authenticator.AAGUID aaguid = com.webauthn4j.data.attestation.authenticator.AAGUID.ZERO;
        byte[] credIdBytes = credentialId.getBytes(StandardCharsets.UTF_8);

        AttestedCredentialData attestedCredentialData = new AttestedCredentialData(aaguid, credIdBytes, coseKey);
        AuthenticatorData<com.webauthn4j.data.extension.authenticator.RegistrationExtensionAuthenticatorOutput> authenticatorData =
                new AuthenticatorData<>(rpIdHash, flags, signCount, attestedCredentialData);

        AttestationObject attestationObject = new AttestationObject(authenticatorData, new NoneAttestationStatement());
        com.webauthn4j.converter.AttestationObjectConverter converter = new com.webauthn4j.converter.AttestationObjectConverter(objectConverter);
        byte[] bytes = converter.convertToBytes(attestationObject);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private byte[] toFixed32Bytes(byte[] input) {
        if (input.length == 32) return input;
        byte[] result = new byte[32];
        if (input.length > 32) {
            System.arraycopy(input, input.length - 32, result, 0, 32);
        } else {
            System.arraycopy(input, 0, result, 32 - input.length, input.length);
        }
        return result;
    }

    private Map<String, String> createPayload(String credentialId, String userEmail, String challenge) throws Exception {
        Map<String, String> payload = new HashMap<>();
        payload.put("credentialId", credentialId);
        payload.put("userEmail", userEmail);
        payload.put("publicKey", "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\n-----END PUBLIC KEY-----");
        payload.put("challenge", challenge);
        payload.put("clientDataJSON", createClientDataJSON(challenge, "webauthn.create"));
        payload.put("attestationObject", createValidAttestationObject(credentialId));
        return payload;
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
    void verifyingUnissuedChallengeIsRejected() throws Exception {
        Map<String, String> payload = createPayload("cred-1", "user@example.com", "not-issued");

        assertThrows(IllegalArgumentException.class,
                () -> controller.verifyRegistration(payload, auth("user@example.com")));
    }

    @Test
    @DisplayName("Registration without attestation payload (unverified key) is rejected (#17865)")
    void registrationWithoutAttestationPayloadIsRejected() {
        Map<String, String> payload = Map.of(
                "credentialId", "cred-unverified",
                "userEmail", "user@example.com",
                "publicKey", "-----BEGIN PUBLIC KEY-----MIIB-----END PUBLIC KEY-----",
                "challenge", "issued-challenge");

        assertThrows(IllegalArgumentException.class,
                () -> controller.verifyRegistration(payload, auth("user@example.com")));
    }

    @Test
    @DisplayName("Registration with forged/malformed attestation object is rejected (#17865)")
    void registrationWithForgedAttestationIsRejected() {
        String challenge = (String) controller.generateRegisterChallenge(auth("user@example.com")).getBody().get("challenge");

        Map<String, String> payload = Map.of(
                "credentialId", "cred-forged",
                "userEmail", "user@example.com",
                "publicKey", "-----BEGIN PUBLIC KEY-----MIIB-----END PUBLIC KEY-----",
                "challenge", challenge,
                "clientDataJSON", createClientDataJSON(challenge, "webauthn.create"),
                "attestationObject", "forged-attestation-base64");

        assertThrows(IllegalArgumentException.class,
                () -> controller.verifyRegistration(payload, auth("user@example.com")));
    }

    @Test
    @DisplayName("Registration with mismatched challenge in clientDataJSON is rejected (#17865)")
    void registrationWithMismatchedChallengeInClientDataIsRejected() throws Exception {
        String challenge = (String) controller.generateRegisterChallenge(auth("user@example.com")).getBody().get("challenge");

        Map<String, String> payload = Map.of(
                "credentialId", "cred-mismatch",
                "userEmail", "user@example.com",
                "publicKey", "-----BEGIN PUBLIC KEY-----MIIB-----END PUBLIC KEY-----",
                "challenge", challenge,
                "clientDataJSON", createClientDataJSON("different-challenge", "webauthn.create"),
                "attestationObject", createValidAttestationObject("cred-mismatch"));

        assertThrows(IllegalArgumentException.class,
                () -> controller.verifyRegistration(payload, auth("user@example.com")));
    }

    @Test
    @DisplayName("Challenge is single-use after a successful verification")
    void challengeIsSingleUse() throws Exception {
        String challenge = (String) controller.generateRegisterChallenge(auth("user@example.com")).getBody().get("challenge");
        Map<String, String> payload = createPayload("cred-1", "user@example.com", challenge);

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

        Map<String, String> payload = createPayload("cred-1", "user@example.com", "stale");

        assertThrows(IllegalArgumentException.class,
                () -> controller.verifyRegistration(payload, auth("user@example.com")));
    }

    @Test
    @DisplayName("Verifying another account's challenge is denied")
    void verifyingAnotherAccountChallengeIsDenied() throws Exception {
        String challenge = (String) controller.generateRegisterChallenge(auth("owner@example.com")).getBody().get("challenge");
        Map<String, String> payload = createPayload("cred-1", "victim@example.com", challenge);

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
    @DisplayName("Successful verification with valid attestation persists the credential")
    void successfulVerificationPersistsCredential() throws Exception {
        String challenge = (String) controller.generateRegisterChallenge(auth("user@example.com")).getBody().get("challenge");
        Map<String, String> payload = createPayload("cred-1", "user@example.com", challenge);

        controller.verifyRegistration(payload, auth("user@example.com"));

        verify(credentialRepository).save(any());
    }
}
