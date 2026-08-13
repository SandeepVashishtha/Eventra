package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Component;
import java.util.*;

/**
 * Abstract Syntax Tree (AST) Parser Engine Mock for Plagiarism Detector (#16266).
 */
@Component
public class ASTParserEngine {

    public List<String> parseToTokens(String code) {
        if (code == null) return Collections.emptyList();
        
        List<String> tokens = new ArrayList<>();
        // Simple AST Tokenizer to extract keywords, symbols, and structure
        String[] words = code.split("\\s+");
        for (String word : words) {
            String clean = word.replaceAll("[^a-zA-Z0-9_]", "");
            if (!clean.isEmpty()) {
                tokens.add(clean);
            }
        }
        return tokens;
    }
}
