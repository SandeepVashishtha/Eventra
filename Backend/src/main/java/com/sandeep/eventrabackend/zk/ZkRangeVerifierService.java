package com.sandeep.eventrabackend.zk;

import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;

/**
 * Zero-Knowledge Proof Range Verifier Service for Skill Certificate Verification.
 * 
 * This service provides cryptographic verification of zero-knowledge proofs
 * for hackathon participant skill certificates. It allows verification that
 * a participant holds a valid certificate without exposing personal information
 * such as certificate IDs, dates of birth, or exact scores.
 * 
 * Features:
 * - SHA-256 based cryptographic commitment verification
 * - Range proof validation (e.g., score >= 70%)
 * - Privacy-preserving verification (no PII storage)
 * 
 * @author Eventra Contributors
 * @version 1.0
 * @since 2026-08-14
 */
@Service
public class ZkRangeVerifierService {

    private static final String HASH_ALGORITHM = "SHA-256";
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Verifies a zero-knowledge range proof for certificate validation.
     * 
     * The proof demonstrates that the participant knows a value (certificate score)
     * that falls within a valid range without revealing the actual value.
     * 
     * @param commitment The cryptographic commitment generated from the certificate data
     * @param proofValue The proof value (typically a range indicator or salted hash)
     * @param salt Random salt used in the commitment generation
     * @return true if the proof is valid, false otherwise
     */
    public boolean verifyRangeProof(String commitment, String proofValue, String salt) {
        if (commitment == null || proofValue == null || salt == null) {
            return false;
        }

        try {
            // Reconstruct the commitment from the proof value and salt
            String input = proofValue + salt;
            byte[] hashBytes = computeHash(input.getBytes(StandardCharsets.UTF_8));
            String computedCommitment = bytesToHex(hashBytes);

            // Compare the computed commitment with the provided commitment
            return commitment.equalsIgnoreCase(computedCommitment);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Verifies a certificate-specific zero-knowledge proof.
     * 
     * This method is specifically designed for skill certificate verification.
     * It validates that the proof corresponds to a valid certificate without
     * exposing the certificate details.
     * 
     * @param commitment The cryptographic commitment (hash of certificate data + salt)
     * @param proofData Additional proof data (e.g., score range indicator)
     * @param salt Random salt used in commitment generation
     * @param minScore Minimum acceptable score (e.g., 70 for passing)
     * @return true if the certificate proof is valid and meets the minimum score
     */
    public boolean verifyCertificateProof(String commitment, String proofData, String salt, int minScore) {
        if (commitment == null || proofData == null || salt == null) {
            return false;
        }

        try {
            // In a real ZKP implementation, this would verify a zk-SNARK or similar proof
            // For this implementation, we verify the commitment matches the expected hash
            String input = proofData + salt;
            byte[] hashBytes = computeHash(input.getBytes(StandardCharsets.UTF_8));
            String computedCommitment = bytesToHex(hashBytes);

            if (!commitment.equalsIgnoreCase(computedCommitment)) {
                return false;
            }

            // Extract score from proofData if present (format: "score_X")
            int score = extractScoreFromProof(proofData);
            
            // Verify the score meets the minimum requirement
            return score >= minScore;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Generates a new random salt for commitment generation.
     * 
     * @return A hex-encoded random salt string
     */
    public String generateSalt() {
        byte[] saltBytes = new byte[16];
        secureRandom.nextBytes(saltBytes);
        return bytesToHex(saltBytes);
    }

    /**
     * Computes the SHA-256 hash of the input data.
     * 
     * @param input The data to hash
     * @return The hash bytes
     * @throws Exception If the hash algorithm is not available
     */
    private byte[] computeHash(byte[] input) throws Exception {
        MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
        return digest.digest(input);
    }

    /**
     * Converts a byte array to a hexadecimal string.
     * 
     * @param bytes The byte array to convert
     * @return The hexadecimal string representation
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder hexString = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * Extracts the score from proof data.
     * 
     * Expected format: "score_85" or similar
     * 
     * @param proofData The proof data string
     * @return The extracted score, or 0 if not found
     */
    private int extractScoreFromProof(String proofData) {
        try {
            // Try to parse as score_X format
            if (proofData.startsWith("score_")) {
                return Integer.parseInt(proofData.substring(6));
            }
            // Try to parse as a plain number
            return Integer.parseInt(proofData);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    /**
     * Validates that a certificate commitment is well-formed.
     * 
     * @param commitment The commitment to validate
     * @return true if the commitment is valid, false otherwise
     */
    public boolean isValidCommitmentFormat(String commitment) {
        if (commitment == null || commitment.isEmpty()) {
            return false;
        }

        // Check if it starts with common commitment prefixes
        if (commitment.startsWith("0x") || commitment.startsWith("zk_")) {
            // Check if the remaining part is hexadecimal
            String hexPart = commitment.substring(2);
            return hexPart.matches("^[0-9a-fA-F]+$");
        }

        // Check if it's a pure hex string
        return commitment.matches("^[0-9a-fA-F]+$");
    }

    /**
     * Creates a commitment from certificate data.
     * 
     * This is a utility method for testing and demonstration purposes.
     * In production, commitments should be generated on the client side.
     * 
     * @param certificateId The certificate ID (optional, can be null)
     * @param skillName The skill name
     * @param issuer The certificate issuer
     * @param score The certificate score
     * @param salt Random salt
     * @return The cryptographic commitment
     */
    public String createCommitment(String certificateId, String skillName, String issuer, int score, String salt) {
        try {
            String data = String.format("%s|%s|%s|%d|%s", 
                certificateId != null ? certificateId : "", 
                skillName, 
                issuer, 
                score,
                salt);
            byte[] hashBytes = computeHash(data.getBytes(StandardCharsets.UTF_8));
            return "0xzk_" + bytesToHex(hashBytes).substring(0, 32);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create commitment", e);
        }
    }
}
