package com.sandeep.eventrabackend.service;

public class PlagiarismReport {
    private final double similarityPercentage;
    private final String verdict;

    public PlagiarismReport(double similarityPercentage, String verdict) {
        this.similarityPercentage = similarityPercentage;
        this.verdict = verdict;
    }

    public double getSimilarityPercentage() {
        return similarityPercentage;
    }

    public String getVerdict() {
        return verdict;
    }
}
