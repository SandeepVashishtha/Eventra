package com.sandeep.eventrabackend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

/**
 * Unit tests for EncryptedAnalyticsController.
 * Verifies input validation/bounding and that the response never claims a
 * verification the server does not perform (#16255).
 */
@ExtendWith(MockitoExtension.class)
class EncryptedAnalyticsControllerTest {

    @Mock
    private PaillierCryptoService paillierCryptoService;

    @InjectMocks
    private EncryptedAnalyticsController controller;

    private static final String MODULUS_N = "1073741827";
    private static final String VALID_CIPHERTEXT = "12345";

    private EncryptedAnalyticsController.HomomorphicSumRequest request;

    @BeforeEach
    void setUp() {
        request = new EncryptedAnalyticsController.HomomorphicSumRequest();
        request.setCiphertexts(new ArrayList<>(List.of(VALID_CIPHERTEXT, "67890")));
        request.setModulusN(MODULUS_N);
    }

    @Test
    @DisplayName("Valid request returns encrypted sum and count, with no false verification claim")
    void validRequestReturnsSumWithoutVerificationClaim() {
        when(paillierCryptoService.aggregateEncryptedSum(List.of(VALID_CIPHERTEXT, "67890"), MODULUS_N))
                .thenReturn("99");

        ResponseEntity<Map<String, Object>> response = controller.aggregateEncryptedSum(request);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("99", response.getBody().get("encryptedSum"));
        assertEquals(2, response.getBody().get("count"));
        assertFalse(response.getBody().containsKey("homomorphicPropertyVerified"),
                "response must not claim verification the server does not perform");
    }

    @Test
    @DisplayName("Empty ciphertext list is rejected")
    void emptyCiphertextsAreRejected() {
        request.setCiphertexts(Collections.emptyList());
        assertThrows(IllegalArgumentException.class, () -> controller.aggregateEncryptedSum(request));
    }

    @Test
    @DisplayName("Null ciphertext list is rejected")
    void nullCiphertextsAreRejected() {
        request.setCiphertexts(null);
        assertThrows(IllegalArgumentException.class, () -> controller.aggregateEncryptedSum(request));
    }

    @Test
    @DisplayName("Oversized ciphertext list is rejected to bound computation")
    void oversizedCiphertextListIsRejected() {
        List<String> many = new ArrayList<>();
        for (int i = 0; i < 10_001; i++) {
            many.add(VALID_CIPHERTEXT);
        }
        request.setCiphertexts(many);
        assertThrows(IllegalArgumentException.class, () -> controller.aggregateEncryptedSum(request));
    }

    @Test
    @DisplayName("Non-integer ciphertext is rejected")
    void nonIntegerCiphertextIsRejected() {
        request.setCiphertexts(new ArrayList<>(List.of(VALID_CIPHERTEXT, "not-a-number")));
        assertThrows(IllegalArgumentException.class, () -> controller.aggregateEncryptedSum(request));
    }

    @Test
    @DisplayName("Oversized ciphertext string is rejected")
    void oversizedCiphertextStringIsRejected() {
        request.setCiphertexts(new ArrayList<>(List.of("9".repeat(4097))));
        assertThrows(IllegalArgumentException.class, () -> controller.aggregateEncryptedSum(request));
    }

    @Test
    @DisplayName("Blank modulusN is rejected")
    void blankModulusIsRejected() {
        request.setModulusN("   ");
        assertThrows(IllegalArgumentException.class, () -> controller.aggregateEncryptedSum(request));
    }

    @Test
    @DisplayName("Non-numeric modulusN is rejected")
    void nonNumericModulusIsRejected() {
        request.setModulusN("modulus");
        assertThrows(IllegalArgumentException.class, () -> controller.aggregateEncryptedSum(request));
    }

    @Test
    @DisplayName("Non-positive modulusN is rejected")
    void nonPositiveModulusIsRejected() {
        request.setModulusN("-17");
        assertThrows(IllegalArgumentException.class, () -> controller.aggregateEncryptedSum(request));
    }

    @Test
    @DisplayName("Oversized modulusN is rejected")
    void oversizedModulusIsRejected() {
        request.setModulusN("9".repeat(4097));
        assertThrows(IllegalArgumentException.class, () -> controller.aggregateEncryptedSum(request));
    }
}
