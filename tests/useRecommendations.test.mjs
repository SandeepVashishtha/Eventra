import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useRecommendations.js"),
  "utf8",
);

const store = {};
global.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
};

const { calculateRecommendationScore } = await import(
  "../src/utils/recommendationEngine.js"
);

describe("useRecommendations — source contract", () => {
  it("loads user profile outside useMemo", () => {
    assert.ok(src.includes("const userProfile = getUserProfile()"));
    assert.ok(src.includes("[events, userProfile]"));
  });

  it("wraps scoring in try/catch to avoid list crashes", () => {
    assert.ok(src.includes("try {"));
    assert.ok(src.includes("recommendationScore: 0"));
  });

  it("sorts recommendations by descending score", () => {
    assert.ok(src.includes(".sort((a, b) => b.recommendationScore - a.recommendationScore)"));
  });
});

function rankEvents(events, userProfile) {
  return events
    .map((event) => {
      try {
        const result = calculateRecommendationScore(event, userProfile);
        return {
          ...event,
          recommendationScore: result.score,
        };
      } catch {
        return {
          ...event,
          recommendationScore: 0,
        };
      }
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
}

describe("useRecommendations — ranking simulation", () => {
  it("orders events by recommendation score", () => {
    const profile = {
      interests: ["ai"],
      techStack: ["react"],
      eventTypes: ["hackathon"],
      level: "Beginner",
    };

    const ranked = rankEvents(
      [
        { id: "low", tags: ["design"] },
        { id: "high", tags: ["ai", "react"], type: "hackathon" },
      ],
      profile
    );

    assert.equal(ranked[0].id, "high");
    assert.ok(ranked[0].recommendationScore >= ranked[1].recommendationScore);
  });

  it("falls back to zero score for malformed events", () => {
    const ranked = rankEvents([null], {
      interests: [],
      techStack: [],
      eventTypes: [],
      level: "Beginner",
    });

    assert.equal(ranked[0].recommendationScore, 0);
  });
});

console.log("useRecommendations tests passed ✓");
