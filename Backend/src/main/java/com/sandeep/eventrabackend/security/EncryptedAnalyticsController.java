package com.sandeep.eventrabackend.security;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigInteger;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Homomorphic aggregation helper (#14040). The endpoint performs a public-key
 * multiplication of ciphertexts; it never decrypts and holds no private key, so
 * it cannot verify anything about the plaintexts. That is reflected in the API
 * (no {@code homomorphicPropertyVerified} field) rather than claiming a
 * verification the server does not perform (#16255).
 */
@RestController
@RequestMapping("/api/analytics/encrypted")
@Tag(name = "Encrypted Analytics", description = "Homomorphic aggregation of encrypted analytics values")
public class EncryptedAnalyticsController {

    private static final int MAX_CIPHERTEXTS = 10_000;
    private static final int MAX_CIPHERTEXT_LENGTH = 4096;
    private static final int MAX_MODULUS_LENGTH = 4096;

    private final PaillierCryptoService paillierCryptoService;

    public EncryptedAnalyticsController(PaillierCryptoService paillierCryptoService) {
        this.paillierCryptoService = paillierCryptoService;
    }

    public static class HomomorphicSumRequest {
        private List<String> ciphertexts;
        private String modulusN;

        public List<String> getCiphertexts() { return ciphertexts; }
        public void setCiphertexts(List<String> ciphertexts) { this.ciphertexts = ciphertexts; }

        public String getModulusN() { return modulusN; }
        public void setModulusN(String modulusN) { this.modulusN = modulusN; }
    }

    @PostMapping("/aggregate-sum")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Aggregate encrypted sums (homomorphic)",
            description = """
                    Computes E(sum) as the product of the supplied ciphertexts modulo n^2.
                    Requires authentication. Inputs are validated and bounded to prevent
                    unbounded computation. The server does not decrypt and holds no private
                    key, so no verification of the plaintexts is claimed.
                    """,
            security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<Map<String, Object>> aggregateEncryptedSum(@RequestBody HomomorphicSumRequest request) {
        List<String> ciphertexts = request.getCiphertexts();
        if (ciphertexts == null || ciphertexts.isEmpty()) {
            throw new IllegalArgumentException("ciphertexts must not be empty");
        }
        if (ciphertexts.size() > MAX_CIPHERTEXTS) {
            throw new IllegalArgumentException(
                    "ciphertexts exceeds the maximum of " + MAX_CIPHERTEXTS + " entries");
        }
        for (String ciphertext : ciphertexts) {
            if (!isBoundedInteger(ciphertext, MAX_CIPHERTEXT_LENGTH)) {
                throw new IllegalArgumentException(
                        "Each ciphertext must be a valid integer (at most "
                                + MAX_CIPHERTEXT_LENGTH + " characters)");
            }
        }

        String modulusN = request.getModulusN();
        if (!isPositiveBoundedInteger(modulusN, MAX_MODULUS_LENGTH)) {
            throw new IllegalArgumentException(
                    "modulusN must be a valid positive integer (at most "
                            + MAX_MODULUS_LENGTH + " characters)");
        }

        String sumCiphertext = paillierCryptoService.aggregateEncryptedSum(ciphertexts, modulusN);

        Map<String, Object> response = new HashMap<>();
        response.put("encryptedSum", sumCiphertext);
        response.put("count", ciphertexts.size());

        return ResponseEntity.ok(response);
    }

    private boolean isBoundedInteger(String value, int maxLength) {
        if (value == null || value.isBlank() || value.length() > maxLength) {
            return false;
        }
        try {
            new BigInteger(value.trim());
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private boolean isPositiveBoundedInteger(String value, int maxLength) {
        if (value == null || value.isBlank() || value.length() > maxLength) {
            return false;
        }
        try {
            return new BigInteger(value.trim()).signum() > 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
