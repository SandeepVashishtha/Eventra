package com.sandeep.eventrabackend.security.audit;

import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/**
 * Merkle Tree Hashing Utility for Audit Log validation (#16268).
 */
@Component
public class MerkleTreeHasher {

    public String computeRootHash(List<String> logs) {
        if (logs == null || logs.isEmpty()) return "";

        List<String> tempTxList = new ArrayList<>(logs);
        List<String> newTxList = new ArrayList<>();

        while (tempTxList.size() > 1) {
            newTxList.clear();
            for (int i = 0; i < tempTxList.size(); i += 2) {
                String left = tempTxList.get(i);
                String right = (i + 1 < tempTxList.size()) ? tempTxList.get(i + 1) : left;
                newTxList.add(sha256(left + right));
            }
            tempTxList = new ArrayList<>(newTxList);
        }

        return tempTxList.get(0);
    }

    private String sha256(String base) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }
}
