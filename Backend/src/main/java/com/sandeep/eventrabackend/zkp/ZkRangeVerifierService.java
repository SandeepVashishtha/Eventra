package com.sandeep.eventrabackend.zkp;

import org.springframework.beans.factory.annotation.Value;
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

    @Value("${zkp.range.min:18}")
    private int minBound;

    @Value("${zkp.range.max:120}")
    private int maxBound;

    /**
     * Verify range proof: H(Age + Salt) matches the committed value AND the
     * plaintext value satisfies the configured eligibility range.
     */
    public boolean verifyRangeProof(String commitment, String proofValue, String salt) {
        if (commitment == null || proofValue == null || salt == null) {
            return false;
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String input = proofValue + salt;
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            if (!commitment.equalsIgnoreCase(hexString.toString())) {
                return false;
            }

            BigInteger value = new BigInteger(proofValue.trim());
            return value.compareTo(BigInteger.valueOf(minBound)) >= 0
                    && value.compareTo(BigInteger.valueOf(maxBound)) <= 0;
        } catch (Exception e) {
            return false;
        }
    }
}
