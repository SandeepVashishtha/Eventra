package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TeamMatchmakingService {

    private final SkillVectorComparator skillVectorComparator;

    public TeamMatchmakingService(SkillVectorComparator skillVectorComparator) {
        this.skillVectorComparator = skillVectorComparator;
    }

    public Map<String, Object> proposeSmartTeamMatch(Map<String, Integer> teamSkills, Map<String, Integer> applicantSkills) {
        double complementarityScore = skillVectorComparator.computeComplementarityScore(teamSkills, applicantSkills);
        double compatibilityScore = skillVectorComparator.computeCosineSimilarity(teamSkills, applicantSkills) * 100.0;
        String primaryComplementarySkill = skillVectorComparator.computePrimaryComplementarySkill(teamSkills, applicantSkills);

        Map<String, Object> result = new HashMap<>();
        // Compatibility is the match-quality percentage (cosine similarity of the
        // skill vectors); complementarity is reported separately as the raw
        // gap-filling score so the two are never conflated (#15295).
        result.put("compatibilityPercentage", Math.round(compatibilityScore));
        result.put("complementarityScore", Math.round(complementarityScore));
        result.put("recommendedMatch", complementarityScore >= 70.0 && compatibilityScore >= 40.0);
        result.put("primaryComplementarySkill", primaryComplementarySkill);

        return result;
    }
}
