import { describe, it } from "node:test";
import assert from "node:assert/strict";

function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

describe("Vector Semantic Search RAG Tests", () => {
  it("should calculate exact cosine similarity between vector embeddings", () => {
    const vecA = [0.1, 0.8, 0.5];
    const vecB = [0.1, 0.8, 0.5];

    const similarity = calculateCosineSimilarity(vecA, vecB);
    assert.equal(Math.round(similarity * 100), 100);
  });
});
