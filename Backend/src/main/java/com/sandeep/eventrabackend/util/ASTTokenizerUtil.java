package com.sandeep.eventrabackend.util;

import java.util.*;

/**
 * Utility for AST Tokenization and Jaccard / K-Gram Winnowing Similarity Calculation.
 */
public class ASTTokenizerUtil {

    private static final int K_GRAM_SIZE = 5;

    /**
     * Tokenize raw code into normalized structural AST token representations,
     * stripping comments, whitespaces, and variable names.
     */
    public static List<String> tokenizeCode(String rawCode) {
        if (rawCode == null) return Collections.emptyList();

        String normalized = rawCode
                .replaceAll("//.*|/\\*[\\s\\S]*?\\*/", "") // Remove comments
                .replaceAll("\"[^\"]*\"|'[^']*'", "STR_LITERAL") // Normalize string literals
                .replaceAll("\\b\\d+\\b", "NUM_LITERAL") // Normalize number literals
                .replaceAll("\\b(let|var|const|function|class|return|if|else|for|while|import|from|export|def|public|private|class|static|void|int|double)\\b", "KW_$1") // Key words
                .replaceAll("\\b[a-zA-Z_][a-zA-Z0-9_]*\\b", "IDENT"); // Replace generic identifier names

        String[] tokens = normalized.split("\\s+");
        List<String> tokenList = new ArrayList<>();
        for (String t : tokens) {
            if (!t.trim().isEmpty()) {
                tokenList.add(t.trim());
            }
        }
        return tokenList;
    }

    /**
     * Compute K-Gram Winnowing Hash Set for a list of AST tokens.
     */
    public static Set<Integer> generateKGramHashes(List<String> tokens) {
        Set<Integer> hashes = new HashSet<>();
        if (tokens.size() < K_GRAM_SIZE) {
            hashes.add(Objects.hash(tokens));
            return hashes;
        }

        for (int i = 0; i <= tokens.size() - K_GRAM_SIZE; i++) {
            List<String> sub = tokens.subList(i, i + K_GRAM_SIZE);
            hashes.add(sub.hashCode());
        }
        return hashes;
    }

    /**
     * Calculate structural similarity score between two code snippets (0.0 to 100.0%).
     */
    public static double calculateSimilarityScore(String codeA, String codeB) {
        List<String> tokensA = tokenizeCode(codeA);
        List<String> tokensB = tokenizeCode(codeB);

        Set<Integer> hashesA = generateKGramHashes(tokensA);
        Set<Integer> hashesB = generateKGramHashes(tokensB);

        if (hashesA.isEmpty() && hashesB.isEmpty()) return 100.0;
        if (hashesA.isEmpty() || hashesB.isEmpty()) return 0.0;

        Set<Integer> intersection = new HashSet<>(hashesA);
        intersection.retainAll(hashesB);

        Set<Integer> union = new HashSet<>(hashesA);
        union.addAll(hashesB);

        double jaccard = (double) intersection.size() / (double) union.size();
        return Math.round(jaccard * 100.0 * 100.0) / 100.0;
    }
}
