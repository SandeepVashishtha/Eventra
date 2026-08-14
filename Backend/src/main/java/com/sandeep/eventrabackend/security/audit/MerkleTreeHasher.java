package com.sandeep.eventrabackend.security.audit;

import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/**
 * Merkle Tree Hashing Utility for Audit Log validation.
 * Provides cryptographic SHA-256 hashing and Merkle Tree computation
 * for ensuring the integrity of audit logs.
 * Feature #17703
 */
@Component
public class MerkleTreeHasher {

    private static final Logger logger = LoggerFactory.getLogger(MerkleTreeHasher.class);

    /**
     * Computes the Merkle Tree root hash from a list of log entries.
     * If the list is empty or null, returns an empty string.
     * 
     * @param logs List of log entries (as strings) to hash
     * @return Hex-encoded SHA-256 Merkle root hash
     */
    public String computeRootHash(List<String> logs) {
        if (logs == null || logs.isEmpty()) {
            logger.debug("Computing root hash for empty log list");
            return "";
        }

        if (logs.size() == 1) {
            return sha256(logs.get(0));
        }

        List<String> currentLevel = new ArrayList<>(logs);

        while (currentLevel.size() > 1) {
            List<String> nextLevel = new ArrayList<>();

            for (int i = 0; i < currentLevel.size(); i += 2) {
                String left = currentLevel.get(i);
                String right = (i + 1 < currentLevel.size()) ? currentLevel.get(i + 1) : left;
                String hash = combineAndHash(left, right);
                nextLevel.add(hash);
            }

            currentLevel = nextLevel;
        }

        String rootHash = currentLevel.get(0);
        logger.debug("Computed Merkle root hash for {} logs: {}", logs.size(), rootHash);
        return rootHash;
    }

    /**
     * Computes SHA-256 hash of a string.
     * 
     * @param base Input string to hash
     * @return Hex-encoded SHA-256 hash
     * @throws RuntimeException if hashing fails
     */
    public String sha256(String base) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hash);
        } catch (Exception ex) {
            logger.error("SHA-256 hashing failed", ex);
            throw new RuntimeException("Failed to compute SHA-256 hash", ex);
        }
    }

    /**
     * Combines two node values with domain separation and hashes the result.
     * Each operand is length-prefixed before concatenation, preventing
     * delimiter-free second-preimage collisions (e.g. "ab"+"c" == "a"+"bc").
     * 
     * @param left Left node value
     * @param right Right node value
     * @return Hex-encoded SHA-256 hash of the domain-separated pair
     * @throws RuntimeException if hashing fails
     */
    public String combineAndHash(String left, String right) {
        try {
            byte[] leftBytes = left.getBytes(StandardCharsets.UTF_8);
            byte[] rightBytes = right.getBytes(StandardCharsets.UTF_8);
            ByteArrayOutputStream out = new ByteArrayOutputStream(leftBytes.length + rightBytes.length + 8);
            appendLengthPrefixed(out, leftBytes);
            appendLengthPrefixed(out, rightBytes);
            return bytesToHex(MessageDigest.getInstance("SHA-256").digest(out.toByteArray()));
        } catch (Exception ex) {
            logger.error("SHA-256 hashing failed", ex);
            throw new RuntimeException("Failed to compute SHA-256 hash", ex);
        }
    }

    private static void appendLengthPrefixed(ByteArrayOutputStream out, byte[] bytes) {
        out.write((bytes.length >>> 24) & 0xFF);
        out.write((bytes.length >>> 16) & 0xFF);
        out.write((bytes.length >>> 8) & 0xFF);
        out.write(bytes.length & 0xFF);
        for (byte b : bytes) {
            out.write(b);
        }
    }

    /**
     * Converts a byte array to a hexadecimal string.
     * 
     * @param bytes Byte array to convert
     * @return Hex-encoded string
     */
    public String bytesToHex(byte[] bytes) {
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
     * Verifies the integrity of a set of logs against a known root hash.
     * 
     * @param logs List of log entries to verify
     * @param expectedRootHash Expected root hash to compare against
     * @return true if the computed root hash matches the expected hash
     */
    public boolean verifyIntegrity(List<String> logs, String expectedRootHash) {
        if (expectedRootHash == null || expectedRootHash.isEmpty()) {
            return logs == null || logs.isEmpty();
        }

        String actualRootHash = computeRootHash(logs);
        boolean isValid = expectedRootHash.equals(actualRootHash);

        if (!isValid) {
            logger.warn("Integrity verification failed. Expected: {}, Actual: {}", 
                    expectedRootHash, actualRootHash);
        }

        return isValid;
    }

    /**
     * Computes the Merkle proof for a specific leaf in the tree.
     * Returns the path of hashes needed to verify the leaf's inclusion.
     * 
     * @param logs List of all log entries in the tree
     * @param leafIndex Index of the leaf to create proof for
     * @return List of sibling hashes forming the Merkle proof
     */
    public List<String> computeMerkleProof(List<String> logs, int leafIndex) {
        List<String> proof = new ArrayList<>();
        
        if (logs == null || logs.isEmpty() || leafIndex < 0 || leafIndex >= logs.size()) {
            return proof;
        }

        List<String> currentLevel = new ArrayList<>(logs);
        int currentIndex = leafIndex;

        while (currentLevel.size() > 1) {
            int siblingIndex = (currentIndex % 2 == 0) ? currentIndex + 1 : currentIndex - 1;
            
            if (siblingIndex < currentLevel.size()) {
                proof.add(currentLevel.get(siblingIndex));
            } else {
                // If no sibling, duplicate the current node
                proof.add(currentLevel.get(currentIndex));
            }

            currentIndex = currentIndex / 2;
            currentLevel = buildNextLevel(currentLevel);
        }

        return proof;
    }

    /**
     * Builds the next level of the Merkle tree from the current level.
     * 
     * @param currentLevel Current level of hashes
     * @return Next level of hashes
     */
    private List<String> buildNextLevel(List<String> currentLevel) {
        List<String> nextLevel = new ArrayList<>();

        for (int i = 0; i < currentLevel.size(); i += 2) {
            String left = currentLevel.get(i);
            String right = (i + 1 < currentLevel.size()) ? currentLevel.get(i + 1) : left;
            nextLevel.add(combineAndHash(left, right));
        }

        return nextLevel;
    }

    /**
     * Verifies a Merkle proof for a leaf's inclusion in the tree.
     * 
     * @param leaf Leaf value to verify
     * @param leafIndex Index of the leaf in the original tree
     * @param proof Merkle proof (list of sibling hashes)
     * @param rootHash Expected root hash of the tree
     * @return true if the proof is valid
     */
    public boolean verifyMerkleProof(String leaf, int leafIndex, List<String> proof, String rootHash) {
        if (proof == null || proof.isEmpty()) {
            return leaf.equals(rootHash);
        }

        String currentHash = leaf;

        for (String sibling : proof) {
            if (leafIndex % 2 == 0) {
                currentHash = combineAndHash(currentHash, sibling);
            } else {
                currentHash = combineAndHash(sibling, currentHash);
            }
            leafIndex = leafIndex / 2;
        }

        return currentHash.equals(rootHash);
    }

    /**
     * Computes a hash chain from a list of root hashes.
     * Each hash in the chain includes the previous hash, creating a blockchain-like structure.
     * 
     * @param rootHashes List of root hashes to chain
     * @return List of chained hashes
     */
    public List<String> computeHashChain(List<String> rootHashes) {
        List<String> chain = new ArrayList<>();
        String previousHash = "";

        for (String rootHash : rootHashes) {
            String chainedHash = combineAndHash(previousHash, rootHash);
            chain.add(chainedHash);
            previousHash = chainedHash;
        }

        return chain;
    }

    /**
     * Validates that a hash chain is consistent.
     * 
     * @param hashChain List of hashes forming the chain
     * @param rootHashes List of root hashes that were used to create the chain
     * @return true if the chain is valid
     */
    public boolean validateHashChain(List<String> hashChain, List<String> rootHashes) {
        if (hashChain.size() != rootHashes.size()) {
            return false;
        }

        String previousHash = "";

        for (int i = 0; i < hashChain.size(); i++) {
            String expectedHash = combineAndHash(previousHash, rootHashes.get(i));
            if (!expectedHash.equals(hashChain.get(i))) {
                return false;
            }
            previousHash = hashChain.get(i);
        }

        return true;
    }

    /**
     * Computes a simple hash of a single log entry.
     * 
     * @param log Log entry to hash
     * @return SHA-256 hash of the log entry
     */
    public String hashLog(String log) {
        return sha256(log);
    }
}
