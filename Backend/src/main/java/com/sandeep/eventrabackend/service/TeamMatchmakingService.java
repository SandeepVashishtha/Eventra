package com.sandeep.eventrabackend.service;

import org.springframework.stereotype.Service;
import java.util.*;

/**
 * Matchmaking service recommending teammates based on skill gaps (#17673).
 */
@Service
public class TeamMatchmakingService {

    private final SkillVectorComparator vectorComparator;

    public TeamMatchmakingService(SkillVectorComparator vectorComparator) {
        this.vectorComparator = vectorComparator;
    }

    public List<String> matchTeammates(double[] targetSkills, Map<String, double[]> pool) {
        List<Map.Entry<String, Double>> matches = new ArrayList<>();

        for (Map.Entry<String, double[]> entry : pool.entrySet()) {
            double distance = vectorComparator.computeDistance(targetSkills, entry.getValue());
            // Closer distance means complementary or similar matching
            matches.add(new AbstractMap.SimpleEntry<>(entry.getKey(), distance));
        }

        matches.sort(Map.Entry.comparingByValue());

        List<String> results = new ArrayList<>();
        for (int i = 0; i < Math.min(2, matches.size()); i++) {
            results.add(matches.get(i).getKey());
        }
        return results;
    }
}
