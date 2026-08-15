package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Vector-Space Skill Gap & Cosine Similarity Match Engine (#14042).
 * Computes skill complementarity delta to form balanced hackathon squads.
 */
@Component
public class SkillVectorComparator {

    /**
     * Compute cosine similarity between two skill vectors.
     */
    public double computeCosineSimilarity(Map<String, Integer> vectorA, Map<String, Integer> vectorB) {
        if (vectorA == null || vectorB == null || vectorA.isEmpty() || vectorB.isEmpty()) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (String key : vectorA.keySet()) {
            int valA = vectorA.getOrDefault(key, 0) != null ? vectorA.getOrDefault(key, 0) : 0;
            Integer valBObj = vectorB.get(key);
            int valB = valBObj != null ? valBObj : 0;

            dotProduct += valA * valB;
            normA += valA * valA;
        }

        for (Integer valBObj : vectorB.values()) {
            int valB = valBObj != null ? valBObj : 0;
            normB += valB * valB;
        }

        if (normA == 0.0 || normB == 0.0) return 0.0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Compute skill complementarity score (higher score = fills missing team skill gaps better).
     */
    public double computeComplementarityScore(Map<String, Integer> teamCurrentSkills, Map<String, Integer> applicantSkills) {
        if (teamCurrentSkills == null || applicantSkills == null) return 50.0;

        double totalGapFilled = 0.0;
        int categories = 0;

        for (Map.Entry<String, Integer> entry : applicantSkills.entrySet()) {
            String skill = entry.getKey();
            Integer applicantProficiencyObj = entry.getValue();
            int applicantProficiency = applicantProficiencyObj != null ? applicantProficiencyObj : 0;
            Integer currentTeamProficiencyObj = teamCurrentSkills.get(skill);
            int currentTeamProficiency = currentTeamProficiencyObj != null ? currentTeamProficiencyObj : 0;

            // Large complementarity score if team is weak (e.g. 0-30%) and applicant is strong (70-100%)
            int gap = Math.max(0, 100 - currentTeamProficiency);
            totalGapFilled += (gap / 100.0) * applicantProficiency;
            categories++;
        }

        return categories > 0 ? Math.min(99.0, Math.max(20.0, (totalGapFilled / categories))) : 50.0;
    }

    /**
     * Identify the applicant skill that fills the largest gap in the team's
     * current skill set. Returns "N/A" when no meaningful gap-filling skill
     * can be determined (#15295).
     */
    public String computePrimaryComplementarySkill(Map<String, Integer> teamCurrentSkills, Map<String, Integer> applicantSkills) {
        if (teamCurrentSkills == null || applicantSkills == null || applicantSkills.isEmpty()) {
            return "N/A";
        }

        String primarySkill = null;
        double bestFill = -1.0;
        for (Map.Entry<String, Integer> entry : applicantSkills.entrySet()) {
            Integer proficiencyObj = entry.getValue();
            int proficiency = proficiencyObj != null ? proficiencyObj : 0;
            int gap = Math.max(0, 100 - teamCurrentSkills.getOrDefault(entry.getKey(), 0));
            double fill = (gap / 100.0) * proficiency;
            if (fill > bestFill) {
                bestFill = fill;
                primarySkill = entry.getKey();
            }
        }
        return primarySkill != null ? primarySkill : "N/A";
    }
}
