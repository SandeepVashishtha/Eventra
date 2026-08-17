package com.sandeep.eventrabackend.service;

public class SentimentResult {
    private final double score;
    private final String label;

    public SentimentResult(double score, String label) {
        this.score = score;
        this.label = label;
    }

    public double getScore() {
        return score;
    }

    public String getLabel() {
        return label;
    }
}
