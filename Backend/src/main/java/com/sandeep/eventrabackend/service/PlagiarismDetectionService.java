package com.sandeep.eventrabackend.service;

import com.sandeep.eventrabackend.util.ASTTokenizerUtil;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PlagiarismDetectionService {

    public static class SubmissionComparison {
        private String submissionIdA;
        private String teamNameA;
        private String submissionIdB;
        private String teamNameB;
        private double similarityPercentage;
        private String riskLevel; // HIGH, MEDIUM, LOW

        public SubmissionComparison(String submissionIdA, String teamNameA, String submissionIdB, String teamNameB, double similarityPercentage) {
            this.submissionIdA = submissionIdA;
            this.teamNameA = teamNameA;
            this.submissionIdB = submissionIdB;
            this.teamNameB = teamNameB;
            this.similarityPercentage = similarityPercentage;
            this.riskLevel = similarityPercentage >= 70.0 ? "HIGH" : similarityPercentage >= 40.0 ? "MEDIUM" : "LOW";
        }

        public String getSubmissionIdA() { return submissionIdA; }
        public String getTeamNameA() { return teamNameA; }
        public String getSubmissionIdB() { return submissionIdB; }
        public String getTeamNameB() { return teamNameB; }
        public double getSimilarityPercentage() { return similarityPercentage; }
        public String getRiskLevel() { return riskLevel; }
    }

    public List<SubmissionComparison> analyzeHackathonSubmissions(Map<String, Map<String, String>> teamSubmissions) {
        List<SubmissionComparison> results = new ArrayList<>();
        List<String> teamIds = new ArrayList<>(teamSubmissions.keySet());

        for (int i = 0; i < teamIds.size(); i++) {
            for (int j = i + 1; j < teamIds.size(); j++) {
                String teamA = teamIds.get(i);
                String teamB = teamIds.get(j);

                String codeA = teamSubmissions.get(teamA).getOrDefault("code", "");
                String codeB = teamSubmissions.get(teamB).getOrDefault("code", "");
                String nameA = teamSubmissions.get(teamA).getOrDefault("name", teamA);
                String nameB = teamSubmissions.get(teamB).getOrDefault("name", teamB);

                double score = ASTTokenizerUtil.calculateSimilarityScore(codeA, codeB);
                results.add(new SubmissionComparison(teamA, nameA, teamB, nameB, score));
            }
        }

        results.sort((a, b) -> Double.compare(b.getSimilarityPercentage(), a.getSimilarityPercentage()));
        return results;
    }

    public String generateCsvAuditReport(List<SubmissionComparison> comparisons) {
        StringBuilder csv = new StringBuilder();
        csv.append("Team A,Team B,Similarity Score (%),Risk Level\n");
        for (SubmissionComparison c : comparisons) {
            csv.append(String.format("\"%s\",\"%s\",%.2f,%s\n",
                    sanitizeCsvCell(c.getTeamNameA()), sanitizeCsvCell(c.getTeamNameB()),
                    c.getSimilarityPercentage(), c.getRiskLevel()));
        }
        return csv.toString();
    }

    /**
     * Neutralize CSV formula injection by prefixing cells that start with a
     * spreadsheet formula metacharacter (=, +, -, @) with a single quote, and
     * escape any embedded double quotes so the CSV cell stays well-formed.
     */
    private String sanitizeCsvCell(String value) {
        if (value == null) {
            return "";
        }
        String cleaned = value.replace("\"", "\"\"");
        // Spreadsheet apps strip leading whitespace/tabs/CR before interpreting a
        // formula, so inspect the first significant character rather than charAt(0).
        String significant = cleaned.replaceFirst("^[\\s\\t\\r\\n]+", "");
        if (!significant.isEmpty() && "=+-@\t\r".indexOf(significant.charAt(0)) >= 0) {
            cleaned = "'" + cleaned;
        }
        return cleaned;
    }
}
