package com.sandeep.eventrabackend.controller;

import com.sandeep.eventrabackend.service.ScoreAggregationService;
import com.sandeep.eventrabackend.service.ScoreAggregationService.CategoryScore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/judging")
@CrossOrigin(origins = "*")
public class JudgingController {

    private final ScoreAggregationService scoreAggregationService;

    public JudgingController(ScoreAggregationService scoreAggregationService) {
        this.scoreAggregationService = scoreAggregationService;
    }

    @PostMapping("/calculate-weighted")
    public ResponseEntity<Map<String, Object>> calculateWeighted(@RequestBody List<CategoryScore> categories) {
        if (categories == null || categories.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Categories list cannot be null or empty"));
        }
        
        double weightedScore = scoreAggregationService.calculateWeightedScore(categories);
        Map<String, Object> response = new HashMap<>();
        response.put("weightedScore", Math.round(weightedScore * 100.0) / 100.0);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/calculate-trimmed-mean")
    public ResponseEntity<Map<String, Object>> calculateTrimmedMean(@RequestBody List<Double> scores) {
        if (scores == null || scores.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Scores list cannot be null or empty"));
        }
        
        List<Double> validScores = scores.stream()
                .filter(Objects::nonNull)
                .filter(score -> !score.isNaN() && !score.isInfinite())
                .toList();
        
        if (validScores.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No valid scores provided"));
        }
        
        double trimmedMean = scoreAggregationService.calculateTrimmedMean(validScores);
        Map<String, Object> response = new HashMap<>();
        response.put("trimmedMeanScore", Math.round(trimmedMean * 100.0) / 100.0);
        return ResponseEntity.ok(response);
    }
}
