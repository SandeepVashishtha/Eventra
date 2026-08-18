package com.sandeep.eventrabackend.security;

import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.List;

/**
 * Paillier Additive Homomorphic Encryption Service (#14040).
 * Computes sum and average aggregations directly on encrypted ciphertexts: E(m1) * E(m2) mod n^2 = E(m1 + m2).
 */
@Service
public class PaillierCryptoService {

    /**
     * Homomorphic Addition of two ciphertexts.
     * Multiply ciphertexts modulo n^2 to yield encryption of the sum of plaintexts.
     */
    public String addEncrypted(String ciphertext1, String ciphertext2, String modulusN) {
        if (ciphertext1 == null || ciphertext2 == null || modulusN == null) {
            throw new IllegalArgumentException("ciphertexts and modulusN are required");
        }

        try {
            BigInteger c1 = new BigInteger(ciphertext1);
            BigInteger c2 = new BigInteger(ciphertext2);
            BigInteger n = new BigInteger(modulusN);
            BigInteger nSquare = n.multiply(n);

            if (c1.compareTo(BigInteger.ONE) <= 0 || c1.compareTo(nSquare) >= 0
                    || c2.compareTo(BigInteger.ONE) <= 0 || c2.compareTo(nSquare) >= 0) {
                throw new IllegalArgumentException("ciphertext out of range for modulus");
            }

            // E(m1 + m2) = (c1 * c2) mod n^2
            BigInteger sumCiphertext = c1.multiply(c2).mod(nSquare);
            return sumCiphertext.toString();
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("ciphertexts and modulusN must be valid integers", e);
        }
    }

    /**
     * Compute homomorphic aggregate sum over a list of encrypted numbers.
     */
    public String aggregateEncryptedSum(List<String> ciphertexts, String modulusN) {
        if (ciphertexts == null || ciphertexts.isEmpty() || modulusN == null) {
            throw new IllegalArgumentException("ciphertexts and modulusN are required");
        }

        BigInteger n = new BigInteger(modulusN);
        BigInteger nSquare = n.multiply(n);
        BigInteger result = BigInteger.ONE;

        for (String cStr : ciphertexts) {
            BigInteger c;
            try {
                c = new BigInteger(cStr);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("ciphertext must be a valid integer", e);
            }
            if (c.compareTo(BigInteger.ONE) <= 0 || c.compareTo(nSquare) >= 0) {
                throw new IllegalArgumentException("ciphertext out of range for modulus");
            }
            result = result.multiply(c).mod(nSquare);
        }

        return result.toString();
    }
}
