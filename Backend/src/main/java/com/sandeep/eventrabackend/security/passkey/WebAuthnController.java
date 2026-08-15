package com.sandeep.eventrabackend.security.passkey;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth/webauthn")
@Tag(name = "WebAuthn", description = "Passkey registration")
public class WebAuthnController {

    private static final int MAX_PENDING_CHALLENGES = 1000;
    private static final Duration CHALLENGE_TTL = Duration.ofMinutes(10);

    private final PasskeyCredentialRepository credentialRepository;

    /**
     * Server-side challenge store keyed by user email. Each challenge is
     * single-use, expires after {@link #CHALLENGE_TTL}, and the map is capped at
     * {@link #MAX_PENDING_CHALLENGES} entries so an attacker cannot grow it
     * without bound (#16258). A challenge is removed once a matching registration
     * is verified, so a client cannot replay a stale challenge against another
     * email.
     */
    private final ConcurrentHashMap<String, ChallengeEntry> pendingChallenges = new ConcurrentHashMap<>();

    public WebAuthnController(PasskeyCredentialRepository credentialRepository) {
        this.credentialRepository = credentialRepository;
    }

    @PostMapping("/register-challenge")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Generate a passkey registration challenge",
            description = "Issues a single-use, expiring challenge for the authenticated user. "
                    + "Authentication is required and the challenge is scoped to the caller's own account.",
            security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> generateRegisterChallenge(Authentication authentication) {
        String userEmail = authentication.getName();
        evictExpiredChallenges();
        if (pendingChallenges.size() >= MAX_PENDING_CHALLENGES) {
            throw new IllegalArgumentException("Too many pending passkey registrations. Please try again shortly.");
        }

        String challenge = UUID.randomUUID().toString();
        pendingChallenges.put(normalize(userEmail), new ChallengeEntry(challenge));

        Map<String, Object> response = new HashMap<>();
        response.put("challenge", challenge);
        response.put("rpName", "Eventra Platform");
        response.put("userEmail", userEmail);
        response.put("timeout", 60000);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-registration")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> verifyRegistration(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        String credentialId = payload.get("credentialId");
        String userEmail = payload.get("userEmail");
        String publicKeyPem = payload.get("publicKey");
        String clientChallenge = payload.get("challenge");

        // The caller must be verifying for their own account — never a victim
        // email supplied in the body (#15366).
        if (authentication == null || !normalize(authentication.getName()).equals(normalize(userEmail))) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only register passkeys for your own account.");
        }

        // The credential must be bound to the challenge we issued for this
        // email. A client-supplied challenge that was never stored (or that has
        // expired) is rejected.
        ChallengeEntry issued = pendingChallenges.get(normalize(userEmail));
        if (issued == null || isExpired(issued) || !issued.challenge.equals(clientChallenge)) {
            throw new IllegalArgumentException(
                    "Registration challenge is missing, expired or was not issued for this account. Please request a new challenge.");
        }

        // Reject empty / malformed credentials before they are persisted.
        if (credentialId == null || credentialId.isBlank()) {
            throw new IllegalArgumentException("credentialId is required.");
        }
        if (publicKeyPem == null || publicKeyPem.isBlank()
                || !publicKeyPem.contains("-----BEGIN") || !publicKeyPem.contains("PUBLIC KEY-----")) {
            throw new IllegalArgumentException("A valid PEM public key is required.");
        }

        PasskeyCredentialRepository.PasskeyCredential cred =
                new PasskeyCredentialRepository.PasskeyCredential(credentialId.trim(), userEmail, publicKeyPem.trim());
        credentialRepository.save(cred);

        // Single-use challenge — consume it so it cannot be replayed.
        pendingChallenges.remove(normalize(userEmail));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "WebAuthn Passkey registered successfully.");
        return ResponseEntity.ok(response);
    }

    private void evictExpiredChallenges() {
        Instant cutoff = Instant.now().minus(CHALLENGE_TTL);
        pendingChallenges.entrySet().removeIf(entry -> entry.getValue().createdAt.isBefore(cutoff));
    }

    private boolean isExpired(ChallengeEntry entry) {
        return entry.createdAt.isBefore(Instant.now().minus(CHALLENGE_TTL));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private static final class ChallengeEntry {
        private final String challenge;
        private final Instant createdAt;

        ChallengeEntry(String challenge) {
            this(challenge, Instant.now());
        }

        ChallengeEntry(String challenge, Instant createdAt) {
            this.challenge = challenge;
            this.createdAt = createdAt;
        }
    }
}
