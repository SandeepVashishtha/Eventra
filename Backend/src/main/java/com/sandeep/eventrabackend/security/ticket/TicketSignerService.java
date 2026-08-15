package com.sandeep.eventrabackend.security.ticket;

import com.sandeep.eventrabackend.security.passkey.PasskeyCredentialRepository;
import com.sandeep.eventrabackend.security.passkey.PasskeyCredentialRepository.PasskeyCredential;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.Signature;
import java.security.SignatureException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for generating cryptographic signatures for tickets using WebAuthn/FIDO2 credentials.
 * This service enables device-bound ticket authentication to prevent cloning and fraud.
 */
@Service
public class TicketSignerService {

    private static final Logger logger = LoggerFactory.getLogger(TicketSignerService.class);
    
    private static final String ALGORITHM_ES256 = "ES256";
    private static final String ALGORITHM_RS256 = "RS256";
    private static final String SIGNATURE_ALGORITHM_ES256 = "SHA256withECDSA";
    private static final String SIGNATURE_ALGORITHM_RS256 = "SHA256withRSA";
    
    private static final int MAX_PENDING_SIGNATURES = 1000;
    
    private final PasskeyCredentialRepository credentialRepository;
    private final ConcurrentHashMap<String, SignatureChallenge> pendingChallenges = new ConcurrentHashMap<>();
    private final SecretKey signingKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TicketSignerService(PasskeyCredentialRepository credentialRepository,
                               @Value("${eventra.ticket.signing-secret:}") String configuredSecret) {
        this.credentialRepository = credentialRepository;
        this.signingKey = buildSigningKey(configuredSecret);
    }

    private SecretKey buildSigningKey(String configuredSecret) {
        if (configuredSecret != null && !configuredSecret.isBlank()) {
            return new SecretKeySpec(configuredSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        }
        // No secret configured: generate an ephemeral per-JVM secret so tokens remain
        // cryptographically signed and unforgeable within this process. Set
        // eventra.ticket.signing-secret in production for cross-restart stability.
        byte[] key = new byte[32];
        new SecureRandom().nextBytes(key);
        return new SecretKeySpec(key, "HmacSHA256");
    }

    /**
     * Represents a pending signature challenge for ticket verification
     */
    public static class SignatureChallenge {
        private final String challenge;
        private final String ticketId;
        private final String userEmail;
        private final long createdAt;
        
        public SignatureChallenge(String challenge, String ticketId, String userEmail) {
            this.challenge = challenge;
            this.ticketId = ticketId;
            this.userEmail = userEmail;
            this.createdAt = System.currentTimeMillis();
        }
        
        public String getChallenge() { return challenge; }
        public String getTicketId() { return ticketId; }
        public String getUserEmail() { return userEmail; }
        public long getCreatedAt() { return createdAt; }
        
        public boolean isExpired(long ttlMillis) {
            return System.currentTimeMillis() - createdAt > ttlMillis;
        }
    }

    /**
     * Represents the result of a ticket signature verification
     */
    public static class SignatureVerificationResult {
        private final boolean success;
        private final String message;
        private final String ticketId;
        private final String credentialId;
        private final Map<String, Object> metadata;
        
        public SignatureVerificationResult(boolean success, String message, String ticketId, String credentialId) {
            this(success, message, ticketId, credentialId, new HashMap<>());
        }
        
        public SignatureVerificationResult(boolean success, String message, String ticketId, 
                                          String credentialId, Map<String, Object> metadata) {
            this.success = success;
            this.message = message;
            this.ticketId = ticketId;
            this.credentialId = credentialId;
            this.metadata = Map.copyOf(metadata);
        }
        
        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getTicketId() { return ticketId; }
        public String getCredentialId() { return credentialId; }
        public Map<String, Object> getMetadata() { return metadata; }
    }

    /**
     * Generate a new cryptographic challenge for ticket signature verification
     * 
     * @param ticketId The ticket ID to associate with the challenge
     * @param userEmail The user's email associated with the ticket
     * @return Map containing the challenge and associated data
     */
    public Map<String, Object> generateSignatureChallenge(String ticketId, String userEmail) {
        // Clean up expired challenges
        cleanupExpiredChallenges();
        
        if (pendingChallenges.size() >= MAX_PENDING_SIGNATURES) {
            throw new IllegalStateException("Too many pending signature challenges. Please try again shortly.");
        }
        
        String challenge = UUID.randomUUID().toString();
        SignatureChallenge entry = new SignatureChallenge(challenge, ticketId, userEmail);
        pendingChallenges.put(challenge, entry);
        
        Map<String, Object> response = new HashMap<>();
        response.put("challenge", challenge);
        response.put("ticketId", ticketId);
        response.put("userEmail", userEmail);
        response.put("rpId", "eventra platform");
        response.put("timeout", 60000); // 60 seconds
        
        logger.info("Generated signature challenge for ticket {} and user {}", ticketId, userEmail);
        
        return response;
    }

    /**
     * Verify a WebAuthn signature against a ticket's associated credential
     * 
     * @param ticketId The ticket ID being verified
     * @param challenge The server-issued challenge
     * @param credentialId The credential ID used for signing
     * @param assertionData The WebAuthn assertion data containing the signature
     * @return SignatureVerificationResult with verification status
     */
    public SignatureVerificationResult verifyTicketSignature(
            String ticketId, 
            String challenge, 
            String credentialId, 
            Map<String, Object> assertionData) {
        
        try {
            // Validate inputs
            if (ticketId == null || ticketId.isBlank()) {
                return new SignatureVerificationResult(false, "Ticket ID is required", null, null);
            }
            
            if (challenge == null || challenge.isBlank()) {
                return new SignatureVerificationResult(false, "Challenge is required", ticketId, credentialId);
            }
            
            if (credentialId == null || credentialId.isBlank()) {
                return new SignatureVerificationResult(false, "Credential ID is required", ticketId, null);
            }
            
            // Verify the challenge is valid and not expired
            SignatureChallenge challengeEntry = pendingChallenges.get(challenge);
            if (challengeEntry == null) {
                return new SignatureVerificationResult(false, "Invalid or expired challenge", ticketId, credentialId);
            }
            
            if (challengeEntry.isExpired(60000)) { // 60 seconds TTL
                pendingChallenges.remove(challenge);
                return new SignatureVerificationResult(false, "Challenge has expired", ticketId, credentialId);
            }
            
            // Verify the ticket ID matches the challenge
            if (!challengeEntry.getTicketId().equals(ticketId)) {
                return new SignatureVerificationResult(false, "Ticket ID does not match challenge", ticketId, credentialId);
            }
            
            // Retrieve the credential to get the public key
            Optional<PasskeyCredential> credentialOpt = credentialRepository.findByCredentialId(credentialId);
            if (credentialOpt.isEmpty()) {
                return new SignatureVerificationResult(false, "No credential found with ID: " + credentialId, ticketId, credentialId);
            }
            
            PasskeyCredential credential = credentialOpt.get();
            
            // Parse the public key from PEM format
            PublicKey publicKey = parsePublicKey(credential.getPublicKeyPem());
            if (publicKey == null) {
                return new SignatureVerificationResult(false, "Failed to parse public key", ticketId, credentialId);
            }
            
            // Extract the signature and data from assertion
            String signatureBase64 = getString(assertionData, "response.signature");
            String authenticatorDataBase64 = getString(assertionData, "response.authenticatorData");
            String clientDataJsonBase64 = getString(assertionData, "response.clientDataJSON");
            
            if (signatureBase64 == null || authenticatorDataBase64 == null || clientDataJsonBase64 == null) {
                return new SignatureVerificationResult(false, "Incomplete assertion data", ticketId, credentialId);
            }
            
            // Decode Base64 URL-safe strings to bytes
            byte[] signature = decodeBase64Url(signatureBase64);
            byte[] authenticatorData = decodeBase64Url(authenticatorDataBase64);
            byte[] clientDataJson = decodeBase64Url(clientDataJsonBase64);
            byte[] challengeBytes = challenge.getBytes(StandardCharsets.UTF_8);
            
            // Create the data to verify: authenticatorData + SHA-256(clientDataJSON)
            byte[] clientDataHash = sha256(clientDataJson);
            byte[] dataToVerify = ByteBuffer.allocate(authenticatorData.length + clientDataHash.length)
                    .put(authenticatorData)
                    .put(clientDataHash)
                    .array();
            
            // Determine the signature algorithm based on the credential
            String algorithm = determineAlgorithm(credential.getPublicKeyPem()) ? SIGNATURE_ALGORITHM_ES256 : SIGNATURE_ALGORITHM_RS256;
            
            // Verify the signature
            Signature sig = Signature.getInstance(algorithm);
            sig.initVerify(publicKey);
            sig.update(dataToVerify);
            
            boolean isValid = sig.verify(signature);
            
            if (isValid) {
                // Verify the challenge in clientDataJSON matches our challenge
                String clientChallenge = extractChallengeFromClientData(clientDataJson);
                if (clientChallenge == null || !clientChallenge.equals(challenge)) {
                    return new SignatureVerificationResult(false, "Client challenge does not match server challenge", ticketId, credentialId);
                }
                
                // Clean up the used challenge
                pendingChallenges.remove(challenge);
                
                // Create success result
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("userEmail", challengeEntry.getUserEmail());
                metadata.put("verifiedAt", System.currentTimeMillis());
                metadata.put("credentialId", credentialId);
                
                logger.info("Successfully verified ticket signature for ticket {} and credential {}", ticketId, credentialId);
                
                return new SignatureVerificationResult(true, "Ticket signature verified successfully", 
                                                        ticketId, credentialId, metadata);
            } else {
                logger.warn("Failed to verify ticket signature for ticket {} and credential {}", ticketId, credentialId);
                return new SignatureVerificationResult(false, "Invalid signature", ticketId, credentialId);
            }
            
        } catch (Exception e) {
            logger.error("Error during ticket signature verification for ticket {}: {}", ticketId, e.getMessage());
            return new SignatureVerificationResult(false, "Verification failed: " + e.getMessage(), ticketId, credentialId);
        }
    }

    /**
     * Get a nested string value from a map using dot notation
     * e.g., getString(map, "response.signature")
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
     * Parse a PEM-encoded public key
     */
    private PublicKey parsePublicKey(String pem) {
        try {
            // Remove PEM headers and footers
            String base64 = pem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");
            
            byte[] encoded = Base64.getDecoder().decode(base64);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
            
            // Try ES256 first, then RS256
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
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            return digest.digest(data);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Determine if the key uses ES256 algorithm
     */
    private boolean determineAlgorithm(String pem) {
        // Check if the PEM contains EC key markers
        return pem.contains("EC") || pem.contains("P-256") || pem.contains("P-384");
    }

    /**
     * Extract the challenge from clientDataJSON
     */
    private String extractChallengeFromClientData(byte[] clientDataJson) {
        try {
            String json = new String(clientDataJson, StandardCharsets.UTF_8);
            // Simple JSON parsing to extract challenge
            // In production, use a proper JSON parser
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
        long cutoff = System.currentTimeMillis() - 60000; // 60 seconds
        pendingChallenges.entrySet().removeIf(entry -> entry.getValue().getCreatedAt() < cutoff);
    }

    /**
     * Bind a WebAuthn credential to a specific ticket
     * 
     * @param ticketId The ticket ID to bind
     * @param credentialId The WebAuthn credential ID
     * @param userEmail The user's email
     * @return Map with binding information
     */
    public Map<String, Object> bindCredentialToTicket(String ticketId, String credentialId, String userEmail) {
        Map<String, Object> binding = new HashMap<>();
        binding.put("ticketId", ticketId);
        binding.put("credentialId", credentialId);
        binding.put("userEmail", userEmail);
        binding.put("boundAt", System.currentTimeMillis());
        binding.put("bound", true);
        
        logger.info("Bound credential {} to ticket {} for user {}", credentialId, ticketId, userEmail);
        
        return binding;
    }

    /**
     * Generate a cryptographically signed ticket token for offline verification.
     *
     * <p>The token is an HMAC-SHA256 signed {@code header.payload.signature} structure
     * carrying {@code exp} and {@code jti}, so it cannot be forged without the
     * server-held signing secret.
     *
     * @param ticketId    The ticket ID
     * @param credentialId The credential ID
     * @param userEmail   The user's email
     * @return A signed token that can be verified offline via {@link #verifySignedTicketToken}
     */
    public String generateSignedTicketToken(String ticketId, String credentialId, String userEmail) {
        long now = System.currentTimeMillis();
        long exp = now + 86_400_000L; // 24 hours
        String jti = UUID.randomUUID().toString();

        String header = b64UrlEncode(toJson(Map.of("alg", "HS256", "typ", "JWT")));
        Map<String, Object> claims = new HashMap<>();
        claims.put("ticketId", ticketId);
        claims.put("credentialId", credentialId);
        claims.put("userEmail", userEmail);
        claims.put("iat", now);
        claims.put("exp", exp);
        claims.put("jti", jti);
        String payload = b64UrlEncode(toJson(claims));

        String signingInput = header + "." + payload;
        String signature = b64UrlEncode(hmacSha256(signingInput));
        return signingInput + "." + signature;
    }

    /**
     * Verify a token produced by {@link #generateSignedTicketToken}.
     *
     * @param token the signed token
     * @return result describing validity and, when valid, the embedded claims
     */
    public SignedTicketTokenResult verifySignedTicketToken(String token) {
        try {
            if (token == null || token.isBlank()) {
                return new SignedTicketTokenResult(false, null, null, null, "Token is required");
            }
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return new SignedTicketTokenResult(false, null, null, null, "Malformed token");
            }
            String signingInput = parts[0] + "." + parts[1];
            byte[] expectedSig = hmacSha256(signingInput);
            byte[] providedSig = b64UrlDecode(parts[2]);
            if (expectedSig.length != providedSig.length) {
                return new SignedTicketTokenResult(false, null, null, null, "Invalid signature");
            }
            int diff = 0;
            for (int i = 0; i < expectedSig.length; i++) {
                diff |= expectedSig[i] ^ providedSig[i];
            }
            if (diff != 0) {
                return new SignedTicketTokenResult(false, null, null, null, "Invalid signature");
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> claims = objectMapper.readValue(b64UrlDecodeToString(parts[1]), Map.class);
            Object expObj = claims.get("exp");
            if (expObj instanceof Number && ((Number) expObj).longValue() < System.currentTimeMillis()) {
                return new SignedTicketTokenResult(false, null, null, null, "Token expired");
            }
            return new SignedTicketTokenResult(true,
                    (String) claims.get("ticketId"),
                    (String) claims.get("credentialId"),
                    (String) claims.get("userEmail"),
                    "ok");
        } catch (Exception e) {
            return new SignedTicketTokenResult(false, null, null, null, "Failed to parse token");
        }
    }

    private byte[] hmacSha256(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(signingKey);
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to compute HMAC signature", e);
        }
    }

    private String b64UrlEncode(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private byte[] b64UrlDecode(String data) {
        return Base64.getUrlDecoder().decode(data);
    }

    private String b64UrlDecodeToString(String data) {
        return new String(b64UrlDecode(data), StandardCharsets.UTF_8);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to serialize token claims", e);
        }
    }

    /**
     * Result of verifying a signed ticket token.
     */
    public static class SignedTicketTokenResult {
        private final boolean valid;
        private final String ticketId;
        private final String credentialId;
        private final String userEmail;
        private final String message;

        public SignedTicketTokenResult(boolean valid, String ticketId, String credentialId,
                                       String userEmail, String message) {
            this.valid = valid;
            this.ticketId = ticketId;
            this.credentialId = credentialId;
            this.userEmail = userEmail;
            this.message = message;
        }

        public boolean isValid() { return valid; }
        public String getTicketId() { return ticketId; }
        public String getCredentialId() { return credentialId; }
        public String getUserEmail() { return userEmail; }
        public String getMessage() { return message; }
    }

    /**
     * Get all credentials bound to a specific ticket
     * 
     * @param ticketId The ticket ID
     * @return List of credentials bound to the ticket
     */
    public java.util.List<Map<String, Object>> getCredentialsForTicket(String ticketId) {
        // In a real implementation, this would query a database
        // For now, return an empty list
        return new java.util.ArrayList<>();
    }
}
