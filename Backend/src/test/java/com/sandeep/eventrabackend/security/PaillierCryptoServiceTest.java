package com.sandeep.eventrabackend.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class PaillierCryptoServiceTest {

    private final PaillierCryptoService service = new PaillierCryptoService();

    @Test
    @DisplayName("Valid ciphertexts are aggregated as product modulo n^2 (#17839)")
    void aggregatesValidCiphertexts() {
        assertEquals("53", service.aggregateEncryptedSum(List.of("25", "36"), "11"));
    }

    @Test
    @DisplayName("Null ciphertexts are rejected instead of returning a default (#17839)")
    void rejectsNullCiphertexts() {
        assertThrows(IllegalArgumentException.class,
                () -> service.aggregateEncryptedSum(null, "11"));
    }

    @Test
    @DisplayName("Empty ciphertexts are rejected instead of returning a default (#17839)")
    void rejectsEmptyCiphertexts() {
        assertThrows(IllegalArgumentException.class,
                () -> service.aggregateEncryptedSum(List.of(), "11"));
    }

    @Test
    @DisplayName("Null modulus is rejected instead of returning a default (#17839)")
    void rejectsNullModulus() {
        assertThrows(IllegalArgumentException.class,
                () -> service.aggregateEncryptedSum(List.of("25"), null));
    }

    @Test
    @DisplayName("Malformed ciphertext is rejected instead of being silently skipped (#17839)")
    void rejectsMalformedCiphertext() {
        assertThrows(IllegalArgumentException.class,
                () -> service.aggregateEncryptedSum(List.of("25", "not-a-number"), "11"));
    }

    @Test
    @DisplayName("Zero and negative ciphertexts are rejected as out of range (#17839)")
    void rejectsNonPositiveCiphertexts() {
        assertThrows(IllegalArgumentException.class,
                () -> service.aggregateEncryptedSum(List.of("0", "36"), "11"));
        assertThrows(IllegalArgumentException.class,
                () -> service.aggregateEncryptedSum(List.of("-5", "36"), "11"));
    }

    @Test
    @DisplayName("Identity ciphertext E(0) is rejected to prevent forged zero aggregates (#17839)")
    void rejectsIdentityCiphertext() {
        assertThrows(IllegalArgumentException.class,
                () -> service.aggregateEncryptedSum(List.of("1", "36"), "11"));
    }

    @Test
    @DisplayName("Ciphertext at or above n^2 is rejected instead of being silently reduced (#17839)")
    void rejectsCiphertextAtOrAboveNSquare() {
        assertThrows(IllegalArgumentException.class,
                () -> service.aggregateEncryptedSum(List.of("121", "36"), "11"));
        assertThrows(IllegalArgumentException.class,
                () -> service.aggregateEncryptedSum(List.of("200", "36"), "11"));
    }

    @Test
    @DisplayName("addEncrypted rejects null/malformed/out-of-range inputs instead of returning a default (#17839)")
    void addEncryptedValidatesInputs() {
        assertThrows(IllegalArgumentException.class, () -> service.addEncrypted(null, "36", "11"));
        assertThrows(IllegalArgumentException.class, () -> service.addEncrypted("25", "not-a-number", "11"));
        assertThrows(IllegalArgumentException.class, () -> service.addEncrypted("1", "36", "11"));
        assertThrows(IllegalArgumentException.class, () -> service.addEncrypted("121", "36", "11"));
        assertEquals("26", service.addEncrypted("25", "36", "11"));
    }
}
