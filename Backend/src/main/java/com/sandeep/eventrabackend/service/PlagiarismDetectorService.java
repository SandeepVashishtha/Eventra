package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.util.*;

/**
 * Plagiarism Detector Service utilizing AST token comparisons (#16266).
 */
@Service
public class PlagiarismDetectorService {

    private final ASTParserEngine astParser;

    public PlagiarismDetectorService(ASTParserEngine astParser) {
        this.astParser = astParser;
    }

    public double calculateSimilarity(String codeA, String codeB) {
        List<String> tokensA = astParser.parseToTokens(codeA);
        List<String> tokensB = astParser.parseToTokens(codeB);

        if (tokensA.isEmpty() || tokensB.isEmpty()) return 0.0;

        Set<String> intersection = new HashSet<>(tokensA);
        intersection.retainAll(tokensB);

        Set<String> union = new HashSet<>(tokensA);
        union.addAll(tokensB);

        if (union.isEmpty()) return 0.0;

        return (double) intersection.size() / union.size() * 100.0;
    }
}
