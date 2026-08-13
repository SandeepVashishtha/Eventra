import { describe, it } from "node:test";
import assert from "node:assert/strict";

function simulatePaillierEncrypt(m, g = 2, n = 1009) {
  // Simplified Paillier simulation: E(m) = g^m mod n^2
  const nSquare = n * n;
  let result = 1;
  for (let i = 0; i < m; i++) {
    result = (result * g) % nSquare;
  }
  return result;
}

function simulatePaillierHomomorphicAdd(c1, c2, n = 1009) {
  // E(m1 + m2) = (c1 * c2) mod n^2
  const nSquare = n * n;
  return (c1 * c2) % nSquare;
}

describe("Homomorphic Encryption (Paillier) Security Tests", () => {
  it("should preserve additive homomorphic property E(m1 + m2) = E(m1) * E(m2)", () => {
    const m1 = 15;
    const m2 = 25;
    const expectedSum = m1 + m2; // 40

    const c1 = simulatePaillierEncrypt(m1);
    const c2 = simulatePaillierEncrypt(m2);

    const aggregatedCiphertext = simulatePaillierHomomorphicAdd(c1, c2);
    const directExpectedCiphertext = simulatePaillierEncrypt(expectedSum);

    assert.equal(aggregatedCiphertext, directExpectedCiphertext);
  });
});
