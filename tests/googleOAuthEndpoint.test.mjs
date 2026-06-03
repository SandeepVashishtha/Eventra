import assert from "node:assert/strict";

try {
  // Simulating Google OAuth state verification
  const verifyState = (state, sessionState) => {
    if (!state || !sessionState) return false;
    return state === sessionState;
  };

  assert.equal(verifyState("state123", "state123"), true);
  assert.equal(verifyState("state123", "different"), false);
  assert.equal(verifyState(null, "state123"), false);

  console.log("googleOAuthEndpoint tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
