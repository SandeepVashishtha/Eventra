package com.sandeep.eventrabackend.security.audit;

import org.springframework.stereotype.Component;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.ArrayList;
import java.util.Base64;

/**
 * Utility compiling lists of logging details to root Merkle hashes (#17665).
 */
@Component
public class MerkleTreeHasher {

    public String computeMerkleRoot(List<String> logs) {
        if (logs == null || logs.isEmpty()) {
            return "";
        }

        List<String> tempTxList = new ArrayList<>(logs);
        List<String> newTxList = new ArrayList<>();

        while (tempTxList.size() > 1) {
            newTxList.clear();
            for (int i = 0; i < tempTxList.size(); i += 2) {
                String left = tempTxList.get(i);
                String right = (i + 1 < tempTxList.size()) ? tempTxList.get(i + 1) : left;
                newTxList.add(hashPair(left, right));
            }
            tempTxList = new ArrayList<>(newTxList);
        }

        return tempTxList.get(0);
    }

    private String hashPair(String left, String right) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((left + right).getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            return "";
        }
    }
}
