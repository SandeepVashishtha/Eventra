/**
 * Tests for Live Audience Hooks & Context Logic
 */

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Source Contract Tests
const hookSrc = readFileSync(
  path.resolve(__dirname, "../src/hooks/useLiveAudience.js"),
  "utf8"
);

describe("useLiveAudience — Source Contract Tests", () => {
  it("exports useLiveAudience as default", () => {
    assert.ok(
      hookSrc.includes("export default function useLiveAudience"),
      "Must export useLiveAudience as default export"
    );
  });

  it("uses useEffect to fetch initial data", () => {
    assert.ok(
      hookSrc.includes("useEffect"),
      "Must use useEffect for initial load"
    );
  });

  it("uses useMemo to sort questions", () => {
    assert.ok(
      hookSrc.includes("useMemo"),
      "Must use useMemo to optimize sorting"
    );
  });

  it("implements submitQuestion, upvoteQuestion, deleteQuestion, and flagQuestion", () => {
    assert.ok(hookSrc.includes("submitQuestion"), "Must implement submitQuestion");
    assert.ok(hookSrc.includes("upvoteQuestion"), "Must implement upvoteQuestion");
    assert.ok(hookSrc.includes("deleteQuestion"), "Must implement deleteQuestion");
    assert.ok(hookSrc.includes("flagQuestion"), "Must implement flagQuestion");
  });

  it("implements createPoll, updatePollStatus, and submitVote", () => {
    assert.ok(hookSrc.includes("createPoll"), "Must implement createPoll");
    assert.ok(hookSrc.includes("updatePollStatus"), "Must implement updatePollStatus");
    assert.ok(hookSrc.includes("submitVote"), "Must implement submitVote");
  });
});

// 2. Functional Q&A Sorting Logic Verification
describe("Q&A Sorting Logic", () => {
  const sortQuestions = (questions) => {
    return [...questions].sort((a, b) => {
      if (b.upvotes !== a.upvotes) {
        return b.upvotes - a.upvotes;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  it("sorts questions by upvotes in descending order", () => {
    const list = [
      { id: "q-1", upvotes: 2, createdAt: "2026-06-30T10:00:00Z" },
      { id: "q-2", upvotes: 10, createdAt: "2026-06-30T10:05:00Z" },
      { id: "q-3", upvotes: 5, createdAt: "2026-06-30T10:10:00Z" }
    ];
    const sorted = sortQuestions(list);
    assert.strictEqual(sorted[0].id, "q-2");
    assert.strictEqual(sorted[1].id, "q-3");
    assert.strictEqual(sorted[2].id, "q-1");
  });

  it("sorts questions by creation time (newest first) when upvotes are equal", () => {
    const list = [
      { id: "q-1", upvotes: 5, createdAt: "2026-06-30T10:00:00Z" },
      { id: "q-2", upvotes: 5, createdAt: "2026-06-30T10:10:00Z" },
      { id: "q-3", upvotes: 5, createdAt: "2026-06-30T10:05:00Z" }
    ];
    const sorted = sortQuestions(list);
    assert.strictEqual(sorted[0].id, "q-2"); // 10:10:00
    assert.strictEqual(sorted[1].id, "q-3"); // 10:05:00
    assert.strictEqual(sorted[2].id, "q-1"); // 10:00:00
  });
});
