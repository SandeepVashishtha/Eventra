package com.sandeep.eventrabackend.security.ticket;

import com.sandeep.eventrabackend.security.passkey.PasskeyCredentialRepository;
import com.sandeep.eventrabackend.security.passkey.PasskeyCredentialRepository.PasskeyCredential;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.MessageDigest;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.*;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * REST Controller for WebAuthn-based ticket signature verification.
 * This controller provides endpoints for:
 * - Generating signature challenges for ticket verification
 * - Verifying WebAuthn signatures for ticket authentication
 * - Managing credential binding to tickets
 * 
 * All endpoints require authentication and use Spring Security annotations
 * for role-based access control.
 */
@RestController
@RequestMapping("/api/tickets")
@Tag(name = "WebAuthn Ticket Verification", description = "WebAuthn-based ticket signature verification endpoints")
public class WebAuthnSignatureVerifier {

    private static final Logger logger = LoggerFactory.getLogger(WebAuthnSignatureVerifier.class);
    
    private static final int MAX_PENDING_CHALLENGES = 1000;
    private static final long CHALLENGE_TTL = 60000; // 60 seconds
    
    private final PasskeyCredentialRepository credentialRepository;
    private final TicketSignerService ticketSignerService;
    
    /**
     * In-memory challenge store keyed by challenge ID.
     * Challenges are single-use, expire after CHALLENGE_TTL, and are cleaned up periodically.
     */
    private final ConcurrentHashMap<String, ChallengeEntry> pendingChallenges = new ConcurrentHashMap<>();

    /**
     * Tracks the last observed authenticator signature counter per credential id
     * in order to detect cloned authenticators or replayed assertions.
     */
    private final ConcurrentHashMap<String, Long> lastSignatureCounter = new ConcurrentHashMap<>();

    public WebAuthnSignatureVerifier(
            PasskeyCredentialRepository credentialRepository,
            TicketSignerService ticketSignerService) {
        this.credentialRepository = credentialRepository;
        this.ticketSignerService = ticketSignerService;
    }

    /**
     * Entry for storing pending challenges with metadata
     */
    private static class ChallengeEntry {
        private final String challenge;
        private final String ticketId;
        private final String userEmail;
        private final long createdAt;
        
        ChallengeEntry(String challenge, String ticketId, String userEmail) {
            this.challenge = challenge;
            this.ticketId = ticketId;
            this.userEmail = userEmail;
            this.createdAt = System.currentTimeMillis();
        }
        
        boolean isExpired() {
            return System.currentTimeMillis() - createdAt > CHALLENGE_TTL;
        }
    }

    /**
     * Response object for verification results
     */
    public static class VerificationResponse {
        private final boolean success;
        private final String message;
        private final String ticketId;
        private final String credentialId;
        private final Map<String, Object> metadata;
        
        public VerificationResponse(boolean success, String message, String ticketId, String credentialId) {
            this(success, message, ticketId, credentialId, new HashMap<>());
        }
        
        public VerificationResponse(boolean success, String message, String ticketId, 
                                   String credentialId, Map<String, Object> metadata) {
            this.success = success;
            this.message = message;
            this.ticketId = ticketId;
            this.credentialId = credentialId;
            this.metadata = Collections.unmodifiableMap(new HashMap<>(metadata));
        }
        
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getTicketId() { return ticketId; }
        public String getCredentialId() { return credentialId; }
        public Map<String, Object> getMetadata() { return metadata; }
    }

    /**
     * Generate a new signature challenge for ticket verification.
     * 
     * This endpoint creates a cryptographic challenge that will be signed by
     * the user's WebAuthn credential. The challenge is associated with a specific
     * ticket and user, ensuring that the signature can only be used for that ticket.
     * 
     * @param ticketId The ticket ID to verify (path variable)
     * @param userEmail The user's email (from request body)
     * @return ResponseEntity with challenge and metadata
     */
    @PostMapping("/{ticketId}/generate-challenge")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Generate WebAuthn signature challenge",
        description = "Creates a cryptographic challenge for WebAuthn-based ticket verification. " +
                      "The challenge is bound to the specific ticket and must be signed by the user's device-bound credential.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> generateSignatureChallenge(
            @PathVariable String ticketId,
            @RequestParam(required = false) String userEmail) {
        
        // Use the authenticated user's email if not provided
        String email = userEmail != null ? userEmail : getCurrentUserEmail();
        
        // Clean up expired challenges
        cleanupExpiredChallenges();
        
        if (pendingChallenges.size() >= MAX_PENDING_CHALLENGES) {
            return ResponseEntity.badRequest().body(
                Map.of("error", "Too many pending challenges. Please try again shortly.")
            );
        }
        
        // Generate new challenge
        String challenge = UUID.randomUUID().toString();
        pendingChallenges.put(challenge, new ChallengeEntry(challenge, ticketId, email));
        
        Map<String, Object> response = new HashMap<>();
        response.put("challenge", challenge);
        response.put("ticketId", ticketId);
        response.put("userEmail", email);
        response.put("rpId", "eventra-platform");
        response.put("timeout", CHALLENGE_TTL);
        response.put("algorithm", "ES256"); // Preferred algorithm
        
        logger.info("Generated WebAuthn challenge for ticket {} and user {}", ticketId, email);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Verify a WebAuthn signature for ticket authentication.
     * 
     * This endpoint verifies the cryptographic signature created by the user's
     * WebAuthn credential. It ensures that:
     * 1. The signature is valid and matches the credential's public key
     * 2. The challenge in the client data matches the server-issued challenge
     * 3. The ticket ID is associated with the challenge
     * 4. The signature hasn't been replayed
     * 
     * @param ticketId The ticket ID being verified (path variable)
     * @param request The verification request containing signature data
     * @return ResponseEntity with verification result
     */
    @PostMapping("/{ticketId}/verify-signature")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Verify WebAuthn ticket signature",
        description = "Verifies a WebAuthn-based cryptographic signature for ticket authentication. " +
                      "The signature must be created with the server-issued challenge and the user's registered credential.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<VerificationResponse> verifySignature(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> request) {
        
        try {
            String challenge = getString(request, "challenge");
            String credentialId = getString(request, "credentialId");
            Map<String, Object> assertionData = getMap(request, "assertionData");
            
            // Validate required fields
            if (challenge == null || challenge.isBlank()) {
                return ResponseEntity.badRequest().body(
                    new VerificationResponse(false, "Challenge is required", ticketId, credentialId)
                );
            }
            
            if (credentialId == null || credentialId.isBlank()) {
                return ResponseEntity.badRequest().body(
                    new VerificationResponse(false, "Credential ID is required", ticketId, null)
                );
            }
            
            if (assertionData == null) {
                return ResponseEntity.badRequest().body(
                    new VerificationResponse(false, "Assertion data is required", ticketId, credentialId)
                );
            }
            
            // Get the challenge entry
            ChallengeEntry challengeEntry = pendingChallenges.get(challenge);
            if (challengeEntry == null) {
                return ResponseEntity.badRequest().body(
                    new VerificationResponse(false, "Invalid or expired challenge", ticketId, credentialId)
                );
            }
            
            // Verify the challenge hasn't expired
            if (challengeEntry.isExpired()) {
                pendingChallenges.remove(challenge);
                return ResponseEntity.badRequest().body(
                    new VerificationResponse(false, "Challenge has expired", ticketId, credentialId)
                );
            }
            
            // Verify the ticket ID matches
            if (!challengeEntry.ticketId.equals(ticketId)) {
                return ResponseEntity.badRequest().body(
                    new VerificationResponse(false, "Ticket ID does not match challenge", ticketId, credentialId)
                );
            }
            
            // Get the credential from repository
            Optional<PasskeyCredential> credentialOpt = credentialRepository.findByCredentialId(credentialId);
            if (credentialOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new VerificationResponse(false, "Credential not found: " + credentialId, ticketId, credentialId)
                );
            }
            
            PasskeyCredential credential = credentialOpt.get();
            
            // Parse the public key
            PublicKey publicKey = parsePublicKey(credential.getPublicKeyPem());
            if (publicKey == null) {
                return ResponseEntity.badRequest().body(
                    new VerificationResponse(false, "Failed to parse public key", ticketId, credentialId)
                );
            }
            
            // Extract assertion data
            String signatureBase64 = getString(assertionData, "response.signature");
            String authenticatorDataBase64 = getString(assertionData, "response.authenticatorData");
            String clientDataJsonBase64 = getString(assertionData, "response.clientDataJSON");
            
            if (signatureBase64 == null || authenticatorDataBase64 == null || clientDataJsonBase64 == null) {
                return ResponseEntity.badRequest().body(
                    new VerificationResponse(false, "Incomplete assertion data", ticketId, credentialId)
                );
            }
            
            // Decode Base64 URL-safe strings
            byte[] signature = decodeBase64Url(signatureBase64);
            byte[] authenticatorData = decodeBase64Url(authenticatorDataBase64);
            byte[] clientDataJson = decodeBase64Url(clientDataJsonBase64);

            // Verify the relying-party ID (rpId) embedded in authenticatorData.
            // The first 32 bytes are the SHA-256 of the rpId; a credential
            // registered (or replayed) for a different rpId must be rejected.
            if (authenticatorData.length < 37) {
                return ResponseEntity.ok().body(
                    new VerificationResponse(false, "Malformed authenticator data", ticketId, credentialId)
                );
            }
            byte[] expectedRpIdHash = sha256("eventra-platform".getBytes(StandardCharsets.UTF_8));
            byte[] actualRpIdHash = Arrays.copyOfRange(authenticatorData, 0, 32);
            if (!MessageDigest.isEqual(expectedRpIdHash, actualRpIdHash)) {
                return ResponseEntity.ok().body(
                    new VerificationResponse(false, "Relying party ID does not match this service", ticketId, credentialId)
                );
            }

            // Create the data to verify: authenticatorData + SHA-256(clientDataJSON)
            byte[] clientDataHash = sha256(clientDataJson);
            byte[] dataToVerify = ByteBuffer.allocate(authenticatorData.length + clientDataHash.length)
                    .put(authenticatorData)
                    .put(clientDataHash)
                    .array();
            
            // Determine the signature algorithm from the parsed public key type,
            // not from attacker-influenced substrings in the client-supplied PEM.
            String algorithm = (publicKey instanceof java.security.interfaces.ECPublicKey)
                    ? "SHA256withECDSA" : "SHA256withRSA";

            // Verify the signature
            Signature sig = Signature.getInstance(algorithm);
            sig.initVerify(publicKey);
            sig.update(dataToVerify);
            boolean isValid = sig.verify(signature);
            
            if (!isValid) {
                return ResponseEntity.ok().body(
                    new VerificationResponse(false, "Invalid signature", ticketId, credentialId)
                );
            }

            // Enforce the authenticator signature counter (bytes 33-37 of
            // authenticatorData) to detect cloned authenticators / replays.
            int signCount = ByteBuffer.wrap(authenticatorData, 33, 4).getInt();
            Long lastCount = lastSignatureCounter.get(credentialId);
            if (lastCount != null && signCount != 0 && signCount <= lastCount) {
                return ResponseEntity.ok().body(
                    new VerificationResponse(false, "Authenticator signature counter indicates a cloned or replayed credential", ticketId, credentialId)
                );
            }
            lastSignatureCounter.put(credentialId, lastCount == null ? signCount : Math.max(lastCount, signCount));
            
            // Extract and verify the challenge from clientDataJSON
            String clientChallenge = extractChallengeFromClientData(clientDataJson);
            if (clientChallenge == null || !clientChallenge.equals(challenge)) {
                return ResponseEntity.ok().body(
                    new VerificationResponse(false, "Client challenge does not match server challenge", ticketId, credentialId)
                );
            }
            
            // Clean up the used challenge (single-use)
            pendingChallenges.remove(challenge);
            
            // Build metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("verifiedAt", System.currentTimeMillis());
            metadata.put("userEmail", challengeEntry.userEmail);
            metadata.put("credentialId", credentialId);
            metadata.put("ticketId", ticketId);
            metadata.put("authenticatorType", getString(assertionData, "type"));
            
            logger.info("Successfully verified WebAuthn signature for ticket {} and credential {}", 
                       ticketId, credentialId);
            
            return ResponseEntity.ok().body(
                new VerificationResponse(true, "Ticket signature verified successfully", 
                                        ticketId, credentialId, metadata)
            );
            
        } catch (Exception e) {
            logger.error("Error during signature verification for ticket {}: {}", ticketId, e.getMessage());
            return ResponseEntity.internalServerError().body(
                new VerificationResponse(false, "Verification failed: " + e.getMessage(), ticketId, null)
            );
        }
    }

    /**
     * Bind a WebAuthn credential to a ticket for future verification.
     * 
     * This endpoint associates a previously registered WebAuthn credential with
     * a specific ticket, enabling device-bound authentication for that ticket.
     * 
     * @param ticketId The ticket ID to bind (path variable)
     * @param request The binding request containing credential information
     * @return ResponseEntity with binding result
     */
    @PostMapping("/{ticketId}/bind-credential")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Bind WebAuthn credential to ticket",
        description = "Associates a WebAuthn credential with a specific ticket for device-bound authentication.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> bindCredentialToTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> request) {
        
        try {
            String credentialId = getString(request, "credentialId");
            String userEmail = getString(request, "userEmail") != null ? 
                getString(request, "userEmail") : getCurrentUserEmail();
            
            if (credentialId == null || credentialId.isBlank()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Credential ID is required")
                );
            }
            
            // Verify the credential exists
            Optional<PasskeyCredential> credentialOpt = credentialRepository.findByCredentialId(credentialId);
            if (credentialOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Credential not found: " + credentialId)
                );
            }
            
            // Use the service to bind the credential
            Map<String, Object> binding = ticketSignerService.bindCredentialToTicket(
                ticketId, credentialId, userEmail
            );
            
            return ResponseEntity.ok(binding);
            
        } catch (Exception e) {
            logger.error("Error binding credential to ticket {}: {}", ticketId, e.getMessage());
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Failed to bind credential: " + e.getMessage())
            );
        }
    }

    /**
     * Generate a signed ticket token for offline verification.
     * 
     * This endpoint creates a signed token that can be verified offline using
     * the ticket's associated WebAuthn credential. Useful for events with poor
     * internet connectivity.
     * 
     * @param ticketId The ticket ID (path variable)
     * @param request The token generation request
     * @return ResponseEntity with signed token
     */
    @PostMapping("/{ticketId}/generate-token")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Generate signed ticket token",
        description = "Creates a signed token for offline ticket verification using WebAuthn.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> generateSignedTicketToken(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> request) {
        
        try {
            String credentialId = getString(request, "credentialId");
            String userEmail = getString(request, "userEmail") != null ? 
                getString(request, "userEmail") : getCurrentUserEmail();
            
            if (credentialId == null || credentialId.isBlank()) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "Credential ID is required")
                );
            }
            
            // Generate the token
            String token = ticketSignerService.generateSignedTicketToken(
                ticketId, credentialId, userEmail
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("ticketId", ticketId);
            response.put("credentialId", credentialId);
            response.put("generatedAt", System.currentTimeMillis());
            response.put("expiresAt", System.currentTimeMillis() + 86400000); // 24 hours
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error generating signed ticket token for ticket {}: {}", ticketId, e.getMessage());
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Failed to generate token: " + e.getMessage())
            );
        }
    }

    /**
     * Get all WebAuthn credentials associated with a ticket.
     * 
     * @param ticketId The ticket ID (path variable)
     * @return ResponseEntity with list of credentials
     */
    @GetMapping("/{ticketId}/credentials")
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Get ticket credentials",
        description = "Retrieves all WebAuthn credentials associated with a specific ticket.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> getTicketCredentials(@PathVariable String ticketId) {
        try {
            List<Map<String, Object>> credentials = ticketSignerService.getCredentialsForTicket(ticketId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("ticketId", ticketId);
            response.put("credentials", credentials);
            response.put("count", credentials.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching credentials for ticket {}: {}", ticketId, e.getMessage());
            return ResponseEntity.internalServerError().body(
                Map.of("error", "Failed to fetch credentials: " + e.getMessage())
            );
        }
    }

    // ========== Helper Methods ==========

    /**
     * Get the current authenticated user's email
     */
    private String getCurrentUserEmail() {
        try {
            // In a real implementation, get from SecurityContext
            // For now, return a placeholder
            return org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
        } catch (Exception e) {
            return "unknown";
        }
    }

    /**
     * Get a nested string value from a map using dot notation
     */
    @SuppressWarnings("unchecked")
    private String getString(Map<String, Object> map, String path) {
        String[] parts = path.split("\\.");
        Object current = map;
        
        for (String part : parts) {
            if (current instanceof Map) {
                current = ((Map<String, Object>) current).get(part);
            } else {
                return null;
            }
        }
        
        return current != null ? current.toString() : null;
    }

    /**
     * Get a nested map value from a map using dot notation
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> getMap(Map<String, Object> map, String path) {
        String[] parts = path.split("\\.");
        Object current = map;
        
        for (String part : parts) {
            if (current instanceof Map) {
                current = ((Map<String, Object>) current).get(part);
            } else {
                return null;
            }
        }
        
        return current instanceof Map ? (Map<String, Object>) current : null;
    }

    /**
     * Parse a PEM-encoded public key
     */
    private PublicKey parsePublicKey(String pem) {
        try {
            String base64 = pem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");
            
            byte[] encoded = Base64.getDecoder().decode(base64);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
            
            try {
                KeyFactory keyFactory = KeyFactory.getInstance("EC");
                return keyFactory.generatePublic(keySpec);
            } catch (InvalidKeySpecException e) {
                KeyFactory keyFactory = KeyFactory.getInstance("RSA");
                return keyFactory.generatePublic(keySpec);
            }
        } catch (Exception e) {
            logger.error("Failed to parse public key: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Decode Base64 URL-safe string to bytes
     */
    private byte[] decodeBase64Url(String base64Url) {
        String base64 = base64Url.replace("-", "+").replace("_", "/");
        int padLength = (4 - (base64.length() % 4)) % 4;
        String padded = base64 + "=".repeat(padLength);
        return Base64.getDecoder().decode(padded);
    }

    /**
     * Create SHA-256 hash of data
     */
    private byte[] sha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(data);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Determine if the key uses ES256 algorithm
     */
    private boolean determineAlgorithm(String pem) {
        return pem.contains("EC") || pem.contains("P-256") || pem.contains("P-384");
    }

    /**
     * Extract the challenge from clientDataJSON
     */
    private String extractChallengeFromClientData(byte[] clientDataJson) {
        try {
            String json = new String(clientDataJson, StandardCharsets.UTF_8);
            int challengeIndex = json.indexOf("\"challenge\":\"");
            if (challengeIndex == -1) return null;
            
            int start = json.indexOf('"', challengeIndex + 12) + 1;
            int end = json.indexOf('"', start);
            return json.substring(start, end);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Clean up expired challenges
     */
    private void cleanupExpiredChallenges() {
        long cutoff = System.currentTimeMillis() - CHALLENGE_TTL;
        pendingChallenges.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
}
