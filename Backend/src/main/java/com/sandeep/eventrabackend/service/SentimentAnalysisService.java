package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class SentimentAnalysisService {

    private static final List<String> POSITIVE_KEYWORDS = Arrays.asList(
        "great", "awesome", "excellent", "good", "love", "amazing", "cool"
    );

    private static final List<String> NEGATIVE_KEYWORDS = Arrays.asList(
        "bad", "terrible", "worst", "slow", "lag", "broken", "fail", "hate"
    );

    public SentimentResult analyzeText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new SentimentResult(0.0, "NEUTRAL");
        }

        String lower = text.toLowerCase();
        long positiveCount = POSITIVE_KEYWORDS.stream().filter(lower::contains).count();
        long negativeCount = NEGATIVE_KEYWORDS.stream().filter(lower::contains).count();

        double score = (double) (positiveCount - negativeCount);
        String label = "NEUTRAL";
        
        if (score > 0) {
            label = "POSITIVE";
        } else if (score < 0) {
            label = "NEGATIVE";
        }

        return new SentimentResult(score, label);
    }
}
