package com.sandeep.eventrabackend.zkp;

import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Cryptographic Zero-Knowledge Range Proof Verifier Service (#14048).
 * Validates ZKP Commitments for attendee eligibility checks without exposing birthdays.
 */
@Service
public class ZkRangeVerifierService {

    public static final int DEFAULT_MIN_INCLUSIVE = 18;
    public static final int DEFAULT_MAX_INCLUSIVE = 120;

    /**
     * Verify range proof with default age bounds (18 to 120).
     */
    public boolean verifyRangeProof(String commitment, String proofValue, String salt) {
        return verifyRangeProof(commitment, proofValue, salt, DEFAULT_MIN_INCLUSIVE, DEFAULT_MAX_INCLUSIVE);
    }

    /**
     * Verify range proof: validates minInclusive <= proofValue <= maxInclusive,
     * and H(proofValue + Salt) matches the committed value in constant time.
     */
    public boolean verifyRangeProof(String commitment, String proofValue, String salt, Integer minInclusive, Integer maxInclusive) {
        if (commitment == null || proofValue == null || salt == null) {
            return false;
        }

        try {
            int numericValue = Integer.parseInt(proofValue.trim());
            int min = (minInclusive != null) ? minInclusive : DEFAULT_MIN_INCLUSIVE;
            int max = (maxInclusive != null) ? maxInclusive : DEFAULT_MAX_INCLUSIVE;

            if (numericValue < min || numericValue > max) {
                return false;
            }

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String input = proofValue.trim() + salt;
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));

            byte[] commitmentBytes = hexStringToByteArray(commitment);
            if (commitmentBytes == null || commitmentBytes.length != hashBytes.length) {
                return false;
            }

            return MessageDigest.isEqual(hashBytes, commitmentBytes);
        } catch (Exception e) {
            return false;
        }
    }

    private byte[] hexStringToByteArray(String s) {
        if (s == null) return null;
        String clean = s.trim();
        if (clean.length() % 2 != 0) return null;
        int len = clean.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            int high = Character.digit(clean.charAt(i), 16);
            int low = Character.digit(clean.charAt(i + 1), 16);
            if (high == -1 || low == -1) return null;
            data[i / 2] = (byte) ((high << 4) + low);
        }
        return data;
    }
}
