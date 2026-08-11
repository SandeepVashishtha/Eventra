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
        double score = skillVectorComparator.computeComplementarityScore(teamSkills, applicantSkills);

        Map<String, Object> result = new HashMap<>();
        result.put("compatibilityPercentage", Math.round(score));
        result.put("recommendedMatch", score >= 70.0);
        result.put("primaryComplementarySkill", "UI/UX & AI");

        return result;
    }
}
