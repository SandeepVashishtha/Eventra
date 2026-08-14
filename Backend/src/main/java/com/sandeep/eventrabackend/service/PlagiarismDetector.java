package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Set;

@Service
public class PlagiarismDetector {

    public PlagiarismReport analyzeSimilarity(String code1, String code2) {
        Set<String> tokens1 = tokenize(code1);
        Set<String> tokens2 = tokenize(code2);

        if (tokens1.isEmpty() || tokens2.isEmpty()) {
            return new PlagiarismReport(0.0, "Empty source contents");
        }

        Set<String> intersection = new HashSet<>(tokens1);
        intersection.retainAll(tokens2);

        double jaccardIndex = (double) intersection.size() / (tokens1.size() + tokens2.size() - intersection.size());
        double percentage = jaccardIndex * 100;

        String verdict = percentage > 70 ? "HIGH SIMILARITY (PLAGIARIZED)" : "ACCEPTABLE ORIGINALITY";
        return new PlagiarismReport(percentage, verdict);
    }

    private Set<String> tokenize(String code) {
        Set<String> tokens = new HashSet<>();
        // Simple regex split for demonstration
        String[] parts = code.split("\\s+|(?=[{}().,;])|(?<=[{}().,;])");
        for (String p : parts) {
            String trimmed = p.trim();
            if (trimmed.length() > 1) {
                tokens.add(trimmed);
            }
        }
        return tokens;
    }
}
