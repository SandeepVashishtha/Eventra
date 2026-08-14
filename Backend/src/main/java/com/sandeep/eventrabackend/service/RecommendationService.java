package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.util.*;

/**
 * Team partner recommendations dispatcher using embedding arrays (#17668).
 */
@Service
public class RecommendationService {

    private final CosineSimilarityEngine similarityEngine;

    public RecommendationService(CosineSimilarityEngine similarityEngine) {
        this.similarityEngine = similarityEngine;
    }

    public List<String> getTopPartners(double[] targetProfile, Map<String, double[]> candidateProfiles) {
        List<Map.Entry<String, Double>> scores = new ArrayList<>();

        for (Map.Entry<String, double[]> entry : candidateProfiles.entrySet()) {
            double score = similarityEngine.calculateCosineSimilarity(targetProfile, entry.getValue());
            scores.add(new AbstractMap.SimpleEntry<>(entry.getKey(), score));
        }

        // Sort descending by match similarity
        scores.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

        List<String> topMatches = new ArrayList<>();
        for (int i = 0; i < Math.min(3, scores.size()); i++) {
            topMatches.add(scores.get(i).getKey());
        }
        return topMatches;
    }
}
