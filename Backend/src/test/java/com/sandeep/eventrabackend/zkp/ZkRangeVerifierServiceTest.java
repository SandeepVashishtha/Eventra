package com.sandeep.eventrabackend.zkp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import static org.junit.jupiter.api.Assertions.*;

class ZkRangeVerifierServiceTest {

    private ZkRangeVerifierService service;

    @BeforeEach
    void setUp() {
        service = new ZkRangeVerifierService();
    }

    private String computeSha256(String input) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }

    @Test
    @DisplayName("Should return true for valid in-range proof and matching commitment")
    void testVerifyRangeProof_ValidInRange() throws Exception {
        String age = "25";
        String salt = "testSalt123";
        String commitment = computeSha256(age + salt);

        boolean result = service.verifyRangeProof(commitment, age, salt, 18, 120);
        assertTrue(result);
    }

    @Test
    @DisplayName("Should return false when proof value is under minInclusive bound")
    void testVerifyRangeProof_UnderMinimum() throws Exception {
        String age = "15";
        String salt = "testSalt123";
        String commitment = computeSha256(age + salt);

        boolean result = service.verifyRangeProof(commitment, age, salt, 18, 120);
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when proof value is over maxInclusive bound")
    void testVerifyRangeProof_OverMaximum() throws Exception {
        String age = "135";
        String salt = "testSalt123";
        String commitment = computeSha256(age + salt);

        boolean result = service.verifyRangeProof(commitment, age, salt, 18, 120);
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when commitment hash does not match proof value")
    void testVerifyRangeProof_HashMismatch() throws Exception {
        String age = "25";
        String salt = "testSalt123";
        String wrongCommitment = computeSha256("26" + salt);

        boolean result = service.verifyRangeProof(wrongCommitment, age, salt, 18, 120);
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when proof value is not a valid integer")
    void testVerifyRangeProof_NonNumericProofValue() {
        boolean result = service.verifyRangeProof("invalidHash", "notANumber", "salt", 18, 120);
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false for null parameters")
    void testVerifyRangeProof_NullInputs() {
        assertFalse(service.verifyRangeProof(null, "25", "salt", 18, 120));
        assertFalse(service.verifyRangeProof("hash", null, "salt", 18, 120));
        assertFalse(service.verifyRangeProof("hash", "25", null, 18, 120));
    }

    @Test
    @DisplayName("Should fallback to default range 18..120 when custom bounds are null")
    void testVerifyRangeProof_DefaultBoundsFallback() throws Exception {
        String age = "25";
        String salt = "testSalt123";
        String commitment = computeSha256(age + salt);

        assertTrue(service.verifyRangeProof(commitment, age, salt, null, null));
        assertTrue(service.verifyRangeProof(commitment, age, salt));
    }
}
