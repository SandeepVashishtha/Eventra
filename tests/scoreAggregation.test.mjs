import { describe, it } from "node:test";
import assert from "node:assert/strict";

function calculateWeightedScore(categories) {
  let totalScore = 0.0;
  let totalWeight = 0.0;
  for (const cat of categories) {
    totalScore += cat.rawScore * (cat.weightPercentage / 100.0);
    totalWeight += cat.weightPercentage;
  }
  return totalWeight > 0 ? totalScore / (totalWeight / 100.0) : 0.0;
}

function calculateTrimmedMean(judgeScores) {
  if (!judgeScores || judgeScores.length === 0) return 0.0;
  if (judgeScores.length <= 2) {
    return judgeScores.reduce((a, b) => a + b, 0) / judgeScores.length;
  }

  const sorted = [...judgeScores].sort((a, b) => a - b);
  sorted.shift(); // remove lowest outlier
  sorted.pop(); // remove highest outlier

  return sorted.reduce((a, b) => a + b, 0) / sorted.length;
}

describe("Hackathon Score Aggregation Matrix Tests", () => {
  it("should calculate weighted category score accurately", () => {
    const categories = [
      { categoryName: "Innovation", weightPercentage: 30, rawScore: 90 },
      { categoryName: "Technical", weightPercentage: 40, rawScore: 80 },
      { categoryName: "UI/UX", weightPercentage: 20, rawScore: 85 },
      { categoryName: "Pitch", weightPercentage: 10, rawScore: 95 },
    ];

    const score = calculateWeightedScore(categories);
    assert.equal(score, 85.5);
  });

  it("should calculate trimmed mean discarding highest and lowest outlier judge scores", () => {
    const scores = [40, 85, 90, 88, 100]; // 40 (outlier low) and 100 (outlier high) discarded
    const trimmed = calculateTrimmedMean(scores);
    assert.equal(trimmed, 87.66666666666667);
  });
});
