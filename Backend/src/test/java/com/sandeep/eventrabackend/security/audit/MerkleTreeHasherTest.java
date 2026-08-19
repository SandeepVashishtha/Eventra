package com.sandeep.eventrabackend.security.audit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Regression tests for the Merkle tree hashing integrity guarantees
 * (issue #17837).
 */
class MerkleTreeHasherTest {

    private final MerkleTreeHasher hasher = new MerkleTreeHasher();

    @Test
    void delimiterCollisionMustProduceDifferentRoots() {
        String rootAbC = hasher.computeRootHash(Arrays.asList("ab", "c"));
        String rootABC = hasher.computeRootHash(Arrays.asList("a", "bc"));

        assertNotEquals(rootAbC, rootABC,
                "delimiter-free concatenation would let ['ab','c'] and ['a','bc'] share a root");
    }

    @Test
    void combineAndHashIsLengthPrefixedAndOrderSensitive() {
        assertNotEquals(hasher.combineAndHash("ab", "c"), hasher.combineAndHash("a", "bc"));
        assertNotEquals(hasher.combineAndHash("a", "bc"), hasher.combineAndHash("bc", "a"));
    }

    @Test
    void rootHashIsDeterministicForSameLogs() {
        List<String> logs = Arrays.asList("log-one", "log-two", "log-three", "log-four");
        assertEquals(hasher.computeRootHash(logs), hasher.computeRootHash(logs));
    }

    @Test
    void tamperedLogIsDetected() {
        List<String> logs = Arrays.asList("log-one", "log-two", "log-three", "log-four");
        String root = hasher.computeRootHash(logs);

        assertTrue(hasher.verifyIntegrity(logs, root));
        assertFalse(hasher.verifyIntegrity(Arrays.asList("log-one", "tampered", "log-three", "log-four"), root));
    }

    @Test
    void merkleProofVerifiesInclusionAndRejectsTampering() {
        List<String> logs = Arrays.asList("a", "b", "c", "d", "e");
        String root = hasher.computeRootHash(logs);

        for (int i = 0; i < logs.size(); i++) {
            List<String> proof = hasher.computeMerkleProof(logs, i);
            assertTrue(hasher.verifyMerkleProof(logs.get(i), i, proof, root),
                    "valid proof for leaf " + i + " must verify");
        }

        List<String> tamperedProof = hasher.computeMerkleProof(logs, 0);
        tamperedProof.set(0, hasher.sha256("some-other-hash"));
        assertFalse(hasher.verifyMerkleProof(logs.get(0), 0, tamperedProof, root),
                "tampered proof must be rejected");
    }

    @Test
    void hashChainValidatesAndDetectsTampering() {
        List<String> roots = Arrays.asList(
                hasher.computeRootHash(Arrays.asList("a", "b", "c", "d")),
                hasher.computeRootHash(Arrays.asList("e", "f", "g", "h")));

        List<String> chain = hasher.computeHashChain(roots);
        assertTrue(hasher.validateHashChain(chain, roots));

        List<String> tamperedChain = new java.util.ArrayList<>(chain);
        tamperedChain.set(0, hasher.sha256("tampered"));
        assertFalse(hasher.validateHashChain(tamperedChain, roots));
    }
}
