package com.sandeep.eventrabackend.ai;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class VectorSearchService {

    private final EventEmbeddingRepository embeddingRepository;

    public VectorSearchService(EventEmbeddingRepository embeddingRepository) {
        this.embeddingRepository = embeddingRepository;
    }

    public double calculateCosineSimilarity(List<Double> vecA, List<Double> vecB) {
        if (vecA == null || vecB == null || vecA.size() != vecB.size() || vecA.isEmpty()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vecA.size(); i++) {
            dotProduct += vecA.get(i) * vecB.get(i);
            normA += vecA.get(i) * vecA.get(i);
            normB += vecB.get(i) * vecB.get(i);
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
