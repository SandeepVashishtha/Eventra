package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Trimmed Mean & Weighted Score Aggregation Service.
 * Calculates normalized scores for hackathon project submissions while discarding judge outliers.
 */
@Service
public class ScoreAggregationService {

    public static class CategoryScore {
        private String categoryName;
        private double weightPercentage;
        private double rawScore; // 0 to 100

        public CategoryScore() {}
        public CategoryScore(String categoryName, double weightPercentage, double rawScore) {
            this.categoryName = categoryName;
            this.weightPercentage = weightPercentage;
            this.rawScore = rawScore;
        }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        public double getWeightPercentage() { return weightPercentage; }
        public void setWeightPercentage(double weightPercentage) { this.weightPercentage = weightPercentage; }
        public double getRawScore() { return rawScore; }
        public void setRawScore(double rawScore) { this.rawScore = rawScore; }
    }

    /**
     * Compute weighted total score for a single judge evaluation (0 - 100).
     */
    public double calculateWeightedScore(List<CategoryScore> categories) {
        if (categories == null || categories.isEmpty()) return 0.0;

        double totalScore = 0.0;
        double totalWeight = 0.0;

        for (CategoryScore cat : categories) {
            double raw = Math.max(0.0, Math.min(100.0, cat.getRawScore()));
            double weight = Math.max(0.0, Math.min(100.0, cat.getWeightPercentage()));
            totalScore += (raw * (weight / 100.0));
            totalWeight += weight;
        }

        return totalWeight > 0 ? (totalScore / (totalWeight / 100.0)) : 0.0;
    }

    /**
     * Calculate Trimmed Mean Score across multiple judges (discards highest & lowest outlier scores).
     */
    public double calculateTrimmedMean(List<Double> judgeScores) {
        if (judgeScores == null || judgeScores.isEmpty()) return 0.0;
        if (judgeScores.size() <= 2) {
            return judgeScores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        }

        List<Double> sorted = new ArrayList<>(judgeScores);
        Collections.sort(sorted);

        // Remove lowest and highest outlier score
        sorted.remove(0);
        sorted.remove(sorted.size() - 1);

        return sorted.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }
}
