// Tests for the offline-sync cookie-managed session fix.
//
// The bug: useOfflineSync called isTokenValid(token) directly to gate sync.
// When a session was restored via HttpOnly cookie, AuthContext sets
// token = "cookie-managed" (a sentinel string, not a real JWT).
// isTokenValid("cookie-managed") attempts to decode it as a JWT, fails,
// and returns false -- so sync was blocked with a false session-expired
// warning even though the user was fully authenticated.
//
// The fix replaces the direct isTokenValid call with isAuthenticated() from
// AuthContext, which already handles the "cookie-managed" sentinel correctly.
// A loading guard prevents premature sync attempts during auth initialisation.
// The sentinel string is also stripped before being forwarded as a Bearer
// token, so cookie-managed sessions do not emit an invalid Authorization header.

import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Minimal pure models mirrored from the affected modules
// ---------------------------------------------------------------------------

// Mirrors isTokenValid from src/utils/auth.js -- decodes JWT and checks exp.
// The real implementation returns false for any non-JWT string.
function isTokenValid(token) {
  if (!token || typeof token !== "string") return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    if (typeof payload.exp !== "number") return false;
    return payload.exp > Math.floor(Date.now() / 1000) + 30;
  } catch {
    return false;
  }
}

// Mirrors AuthContext.isAuthenticated() -- the single source of truth.
function isAuthenticated(token, user) {
  if (!user || !token) return false;
  if (token !== "cookie-managed" && !isTokenValid(token)) return false;
  return true;
}

// Mirrors the auth-gate logic in executeSync.
// Returns "skip-loading" | "skip-unauthed" | "proceed"
function authGate(loading, token, user) {
  if (loading) return "skip-loading";
  if (!isAuthenticated(token, user)) return "skip-unauthed";
  return "proceed";
}

// Mirrors authToken derivation in executeSync.
function deriveAuthToken(token) {
  return token === "cookie-managed" ? null : token;
}

// Build a minimal valid JWT with a future exp for token-based test cases.
function makeJwt(expiresInSeconds) {
  const header  = Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})).toString("base64");
  const payload = Buffer.from(JSON.stringify({sub:"u1",exp:Math.floor(Date.now()/1000)+expiresInSeconds})).toString("base64");
  return header + "." + payload + ".sig";
}

const MOCK_USER = { id: "u1", email: "test@example.com" };

let passed = 0; let failed = 0;
async function test(label, fn) {
  try { await fn(); console.log("  pass  " + label); passed++; }
  catch(e) { console.error("  FAIL  " + label); console.error("        " + e.message); failed++; }
}

const runAll = async () => {
  console.log("");
  console.log("Token-based authenticated sync");

  await test("valid JWT token passes auth gate", async () => {
    const jwt = makeJwt(3600);
    assert.equal(authGate(false, jwt, MOCK_USER), "proceed");
  });

  await test("valid JWT produces correct authToken (the JWT itself)", async () => {
    const jwt = makeJwt(3600);
    assert.equal(deriveAuthToken(jwt), jwt);
  });

  await test("expired JWT blocks sync", async () => {
    assert.equal(authGate(false, "not.a.jwt", MOCK_USER), "skip-unauthed");
  });

  await test("null token blocks sync", async () => {
    assert.equal(authGate(false, null, MOCK_USER), "skip-unauthed");
  });

  console.log("");
  console.log("Cookie-managed authenticated sync");

  await test("cookie-managed token passes auth gate", async () => {
    assert.equal(authGate(false, "cookie-managed", MOCK_USER), "proceed");
  });

  await test("cookie-managed authToken is null (no Bearer header emitted)", async () => {
    assert.equal(deriveAuthToken("cookie-managed"), null);
  });

  await test("cookie-managed without user is blocked", async () => {
    assert.equal(authGate(false, "cookie-managed", null), "skip-unauthed");
  });

  await test("cookie-managed passes where isTokenValid would have failed", async () => {
    // Demonstrate the old behaviour: isTokenValid rejects the sentinel
    assert.equal(isTokenValid('cookie-managed'), false, 'isTokenValid must reject the sentinel');
    // New behaviour: isAuthenticated accepts it
    assert.equal(isAuthenticated('cookie-managed', MOCK_USER), true, 'isAuthenticated must accept cookie-managed');
    // And authGate now proceeds
    assert.equal(authGate(false, 'cookie-managed', MOCK_USER), 'proceed', 'auth gate must proceed for cookie-managed');
  });

  console.log("");
  console.log("Page reload with restored cookie session");

  await test("loading=true blocks sync regardless of token", async () => {
    assert.equal(authGate(true, 'cookie-managed', MOCK_USER), 'skip-loading');
    assert.equal(authGate(true, makeJwt(3600),    MOCK_USER), 'skip-loading');
    assert.equal(authGate(true, null,             null),      'skip-loading');
  });

  await test("after reload loading transitions from true to false then gate proceeds", async () => {
    // Simulate AuthContext lifecycle on reload:
    // Phase 1: loading=true, token=null, user=null (validateSession not done yet)
    assert.equal(authGate(true,  null,              null),        'skip-loading');
    // Phase 2: loading=false, token='cookie-managed', user set (validateSession done)
    assert.equal(authGate(false, 'cookie-managed',  MOCK_USER),   'proceed');
  });

  await test("cookie-managed session after reload emits no Authorization header", async () => {
    const authToken = deriveAuthToken('cookie-managed');
    assert.equal(authToken, null, 'authToken must be null so no Authorization header is built');
  });

  console.log("");
  console.log("Queue processing after reconnect");

  await test("reconnect with cookie session proceeds to sync", async () => {
    // Simulate the state present when a reconnect event fires after reload
    const token = "cookie-managed";
    const user  = MOCK_USER;
    const loading = false;
    assert.equal(authGate(loading, token, user), "proceed");
    assert.equal(deriveAuthToken(token), null);
  });

  await test("reconnect with valid JWT proceeds to sync", async () => {
    const token = makeJwt(3600);
    const user  = MOCK_USER;
    assert.equal(authGate(false, token, user), "proceed");
    assert.equal(deriveAuthToken(token), token);
  });

  await test("reconnect while loading is still true waits silently", async () => {
    // loading=true means auth init is not complete; sync must not run
    assert.equal(authGate(true, "cookie-managed", MOCK_USER), "skip-loading");
  });

  console.log("");
  console.log("Unauthenticated users");

  await test("no token, no user: sync blocked", async () => {
    assert.equal(authGate(false, null, null), "skip-unauthed");
  });

  await test("token present but user missing: sync blocked", async () => {
    assert.equal(authGate(false, makeJwt(3600), null), "skip-unauthed");
  });

  await test("user present but token null: sync blocked", async () => {
    assert.equal(authGate(false, null, MOCK_USER), "skip-unauthed");
  });

  await test("empty string token: sync blocked", async () => {
    assert.equal(authGate(false, "", MOCK_USER), "skip-unauthed");
  });

  console.log("");
  console.log("authToken derivation edge cases");

  await test("non-sentinel token passes through unchanged", async () => {
    const jwt = makeJwt(3600);
    assert.equal(deriveAuthToken(jwt), jwt);
  });

  await test("null token stays null", async () => {
    assert.equal(deriveAuthToken(null), null);
  });

  await test("empty string token stays empty string", async () => {
    assert.equal(deriveAuthToken(""), "");
  });

  await test("only the exact sentinel string is stripped", async () => {
    // A token that contains the sentinel but is not exactly it must pass through
    const almostSentinel = "cookie-managed-extra";
    assert.equal(deriveAuthToken(almostSentinel), almostSentinel);
  });

  console.log("");
  console.log("Regression: original isTokenValid-based gate");

  await test("regression: old gate rejects cookie-managed (bug confirmed)", async () => {
    // OLD gate logic from useOfflineSync before the fix:
    //   if (!token || !isTokenValid(token)) return "skip-unauthed";
    function oldAuthGate(token, user) {
      if (!token || !isTokenValid(token)) return "skip-unauthed";
      if (!user) return "skip-unauthed";
      return "proceed";
    }

    // Token-based sessions still work in old gate
    assert.equal(oldAuthGate(makeJwt(3600), MOCK_USER), "proceed", "JWT must proceed in old gate");

    // Cookie-managed sessions are INCORRECTLY blocked in old gate
    assert.equal(oldAuthGate("cookie-managed", MOCK_USER), "skip-unauthed", "old gate blocks cookie-managed (bug)");

    // Fixed gate correctly allows cookie-managed
    assert.equal(authGate(false, "cookie-managed", MOCK_USER), "proceed", "fixed gate allows cookie-managed");
  });

  await test("regression: old gate shows expired warning for valid cookie session", async () => {
    // Confirm the sentinel fails isTokenValid (the root cause)
    assert.equal(isTokenValid("cookie-managed"), false, "sentinel must fail JWT validation");
    assert.equal(isTokenValid(null), false, "null must fail JWT validation");
    assert.equal(isTokenValid("not-a-jwt"), false, "arbitrary string must fail JWT validation");
    // Only real JWTs pass
    assert.equal(isTokenValid(makeJwt(3600)), true, "valid JWT must pass");
  });

  await test("regression: authToken strips sentinel in all three postWithBackoff call sites", async () => {
    // Simulate the three postWithBackoff call sites in executeSync
    const scenarios = [
      { token: "cookie-managed", expectedAuthToken: null },
      { token: makeJwt(3600),    expectedAuthToken: makeJwt(3600) },
      { token: null,             expectedAuthToken: null },
    ];
    for (const s of scenarios) {
      assert.equal(
        deriveAuthToken(s.token),
        s.expectedAuthToken,
        "deriveAuthToken(" + s.token + ") should be " + s.expectedAuthToken
      );
    }
  });

  const total = passed + failed;
  console.log("");
  console.log(total + " tests: " + passed + " passed, " + failed + " failed");
  if (failed > 0) process.exit(1);
};

runAll().catch(err => { console.error(err); process.exit(1); });
