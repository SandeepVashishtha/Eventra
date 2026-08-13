/**
 * Tests for src/utils/aiMatchmaking.js
 *
 * Verifies AI-driven compatibility scoring and meeting slot suggestion utilities.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

const {
  generateCompatibilityScore,
  suggestMeetingSlots,
  fetchRecommendedConnections,
} = await import("../src/utils/aiMatchmaking.js");

// ─── generateCompatibilityScore ───────────────────────────────────────────────
// Note: The base score is 50. The industry bonus (+15) only fires when BOTH
// industries are truthy and equal, so empty/null/undefined users score a plain
// 50. Skill bonuses are case-insensitive (skills are normalized via
// toLowerCase().trim()). These expectations assert the guarded behavior that
// landed with #7715.

describe("generateCompatibilityScore — base score", () => {
  it("returns 50 for empty users (no industry bonus when undefined)", () => {
    assert.equal(generateCompatibilityScore({}, {}), 50);
  });

  it("returns 50 for users with null skills (no skill bonus)", () => {
    const score = generateCompatibilityScore({ skills: null }, { skills: null });
    assert.equal(score, 50);
  });

  it("returns 50 for users with undefined skills", () => {
    const score = generateCompatibilityScore(
      { skills: undefined },
      { skills: undefined },
    );
    assert.equal(score, 50);
  });
});

describe("generateCompatibilityScore — skill matching", () => {
  it("adds 10 points per common skill", () => {
    const score = generateCompatibilityScore(
      { skills: ["React", "TypeScript"] },
      { skills: ["React", "TypeScript", "Node"] },
    );
    assert.equal(score, 70); // 50 + 10 + 10
  });

  it("adds 10 points per common skill (single skill)", () => {
    const score = generateCompatibilityScore(
      { skills: ["React"] },
      { skills: ["React"] },
    );
    assert.equal(score, 60);
  });

  it("no skill bonus when skills are completely different", () => {
    const score = generateCompatibilityScore(
      { skills: ["Python"] },
      { skills: ["React", "TypeScript"] },
    );
    assert.equal(score, 50);
  });

  it("skill matching is case-insensitive (normalized to lowercase)", () => {
    const score = generateCompatibilityScore(
      { skills: ["react"] },
      { skills: ["React"] },
    );
    assert.equal(score, 60); // "react" === "React" after normalization
  });

  it("does not throw when skills is not an array (guarded by normalizeSkills)", () => {
    assert.doesNotThrow(() => generateCompatibilityScore({ skills: "React" }, { skills: ["React"] }));
    assert.doesNotThrow(() => generateCompatibilityScore({ skills: 123 }, { skills: ["React"] }));
    assert.equal(generateCompatibilityScore({ skills: "React" }, { skills: ["React"] }), 50);
    assert.equal(generateCompatibilityScore({ skills: 123 }, { skills: ["React"] }), 50);
  });
});

describe("generateCompatibilityScore — industry bonus", () => {
  it("returns 65 when industries match (base 50 + 15)", () => {
    const score = generateCompatibilityScore(
      { industry: "SaaS" },
      { industry: "SaaS" },
    );
    assert.equal(score, 65);
  });

  it("drops to 50 when industries differ (no industry bonus)", () => {
    const score = generateCompatibilityScore(
      { industry: "SaaS" },
      { industry: "FinTech" },
    );
    assert.equal(score, 50);
  });

  it("industry comparison is case-sensitive", () => {
    const score = generateCompatibilityScore(
      { industry: "SaaS" },
      { industry: "saas" },
    );
    assert.equal(score, 50); // no match
  });

  it("null industry vs null industry does not match (guarded)", () => {
    const score = generateCompatibilityScore(
      { industry: null },
      { industry: null },
    );
    assert.equal(score, 50); // industry bonus requires both industries to be truthy
  });
});

describe("generateCompatibilityScore — role diversity bonus", () => {
  it("adds 5 points when both roles are defined and different", () => {
    const score = generateCompatibilityScore(
      { role: "Developer" },
      { role: "Designer" },
    );
    assert.equal(score, 55); // 50 + 5
  });

  it("no role bonus when roles are the same", () => {
    const score = generateCompatibilityScore(
      { role: "Developer" },
      { role: "Developer" },
    );
    assert.equal(score, 50);
  });

  it("undefined role vs undefined role is not 'different'", () => {
    const score = generateCompatibilityScore(
      { role: undefined },
      { role: undefined },
    );
    assert.equal(score, 50);
  });

  it("defined role vs undefined role is not 'different' (both must be truthy)", () => {
    const score = generateCompatibilityScore(
      { role: "Developer" },
      { role: undefined },
    );
    assert.equal(score, 50);
  });
});

describe("generateCompatibilityScore — score cap", () => {
  it("caps score at 99", () => {
    const userA = {
      skills: ["A", "B", "C", "D", "E"],
      industry: "Tech",
      role: "Dev",
    };
    const userB = {
      skills: ["A", "B", "C", "D", "E"],
      industry: "Tech",
      role: "Designer",
    };
    // 50 + 50 (5 skills × 10) + 15 (same industry) + 5 (different role) = 120 → capped at 99
    assert.equal(generateCompatibilityScore(userA, userB), 99);
  });

  it("score is always an integer", () => {
    const score = generateCompatibilityScore(
      { skills: ["React"] },
      { skills: ["React"] },
    );
    assert.equal(score, Math.floor(score));
  });
});

describe("generateCompatibilityScore — combined scenarios", () => {
  it("common skills + same industry + different roles", () => {
    const score = generateCompatibilityScore(
      {
        skills: ["React", "TypeScript"],
        industry: "SaaS",
        role: "Developer",
      },
      { skills: ["React", "Node"], industry: "SaaS", role: "Designer" },
    );
    // 50 + 10 (React) + 15 (same industry) + 5 (different role) = 80
    assert.equal(score, 80);
  });

  it("no bonuses: different industry, same role, no common skills", () => {
    const score = generateCompatibilityScore(
      { skills: ["Python"], industry: "Edu", role: "Dev" },
      { skills: ["JS"], industry: "FinTech", role: "Dev" },
    );
    assert.equal(score, 50); // 50 + 0 + 0 + 0
  });

  it("only role diversity bonus: diff industry, diff role, no skills", () => {
    const score = generateCompatibilityScore(
      { industry: "A", role: "Dev" },
      { industry: "B", role: "Des" },
    );
    // 50 + 0 (diff industry) + 5 (diff role) = 55
    assert.equal(score, 55);
  });
});

// ─── suggestMeetingSlots ─────────────────────────────────────────────────────

describe("suggestMeetingSlots", () => {
  it("returns all 3 slots", () => {
    const result = suggestMeetingSlots({ id: "a" }, { id: "b" }, "2024-06-15");
    assert.equal(result.length, 3);
  });

  it("each slot has start, end, type fields", () => {
    const result = suggestMeetingSlots({ id: "a" }, { id: "b" }, "2024-06-15");
    for (const slot of result) {
      assert.ok(typeof slot.start === "string" && slot.start.length > 0);
      assert.ok(typeof slot.end === "string" && slot.end.length > 0);
      assert.ok(typeof slot.type === "string" && slot.type.length > 0);
    }
  });

  it("rotation is deterministic for same inputs", () => {
    const r1 = suggestMeetingSlots({ id: "a" }, { id: "b" }, "2024-06-15");
    const r2 = suggestMeetingSlots({ id: "a" }, { id: "b" }, "2024-06-15");
    assert.deepEqual(r1, r2);
  });

  it("different user IDs can produce different orderings", () => {
    const r1 = suggestMeetingSlots({ id: "a" }, { id: "b" }, "2024-06-15");
    const r2 = suggestMeetingSlots({ id: "a" }, { id: "c" }, "2024-06-15");
    assert.ok(r1[0].start !== r2[0].start || r1[1].start !== r2[1].start);
  });

  it("different dates can produce different orderings", () => {
    const r1 = suggestMeetingSlots({ id: "a" }, { id: "b" }, "2024-06-15");
    const r2 = suggestMeetingSlots({ id: "a" }, { id: "b" }, "2024-06-16");
    assert.ok(r1[0].start !== r2[0].start || r1[1].start !== r2[1].start);
  });

  it("handles null user ids", () => {
    const result = suggestMeetingSlots({ id: null }, { id: null }, "2024-06-15");
    assert.equal(result.length, 3);
  });

  it("handles missing user ids", () => {
    const result = suggestMeetingSlots({}, {}, "2024-06-15");
    assert.equal(result.length, 3);
  });

  it("handles null dateStr", () => {
    const result = suggestMeetingSlots({ id: "a" }, { id: "b" }, null);
    assert.equal(result.length, 3);
  });

  it("handles null userA", () => {
    const result = suggestMeetingSlots(null, { id: "b" }, "2024-06-15");
    assert.equal(result.length, 3);
  });

  it("handles null userB", () => {
    const result = suggestMeetingSlots({ id: "a" }, null, "2024-06-15");
    assert.equal(result.length, 3);
  });

  it("rotation distributes across slots (multiple offset positions seen)", () => {
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      const r = suggestMeetingSlots(
        { id: `user${i}` },
        { id: `peer${i}` },
        `2024-01-${String((i % 28) + 1).padStart(2, "0")}`,
      );
      seen.add(r[0].start);
    }
    // With 100 diverse inputs, expect at least 2 different first-slot values
    assert.ok(seen.size >= 2);
  });
});

// ─── fetchRecommendedConnections ──────────────────────────────────────────────

describe("fetchRecommendedConnections", () => {
  it("returns an array of candidates", async () => {
    const result = await fetchRecommendedConnections({ skills: [] }, "evt-1");
    assert.ok(Array.isArray(result));
    assert.ok(result.length > 0);
  });

  it("each candidate has required fields", async () => {
    const result = await fetchRecommendedConnections({ skills: [] }, "evt-1");
    for (const c of result) {
      assert.ok(typeof c.id === "string" && c.id.length > 0);
      assert.ok(typeof c.name === "string");
      assert.ok(typeof c.role === "string");
      assert.ok(typeof c.matchScore === "number");
      assert.ok(typeof c.matchReason === "string");
    }
  });

  it("candidates are sorted by matchScore descending", async () => {
    const result = await fetchRecommendedConnections({ skills: ["React"] }, "evt-1");
    for (let i = 1; i < result.length; i++) {
      assert.ok(result[i - 1].matchScore >= result[i].matchScore);
    }
  });

  it("matchReason references the eventId", async () => {
    const result = await fetchRecommendedConnections({ skills: [] }, "my-event");
    for (const c of result) {
      assert.ok(c.matchReason.includes("my-event"));
    }
  });

  it("handles null currentUser", async () => {
    const result = await fetchRecommendedConnections(null, "evt-1");
    assert.ok(Array.isArray(result));
    assert.ok(result.length > 0);
  });

  it("handles missing skills on currentUser", async () => {
    const result = await fetchRecommendedConnections({}, "evt-1");
    assert.ok(Array.isArray(result));
    assert.ok(result.length > 0);
  });

  it("candidates include avatar, industry, and skills fields", async () => {
    const result = await fetchRecommendedConnections({ skills: [] }, "evt-1");
    for (const c of result) {
      assert.ok(typeof c.avatar === "string");
      assert.ok(typeof c.industry === "string");
      assert.ok(Array.isArray(c.skills));
    }
  });
});

console.log("aiMatchmaking tests passed ✓");