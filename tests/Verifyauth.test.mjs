/**
 * tests/verifyAuth.test.mjs
 *
 * Unit tests for the verifyAuth middleware (api/middleware/auth.js).
 *
 * Uses only node:assert — no external test runner required.
 * Run: node tests/verifyAuth.test.mjs
 */

import assert from "node:assert/strict";

// ─── Dependency injection ─────────────────────────────────────────────────────
//
// verifyAuth imports `jsonwebtoken`, `../auth/jwt-config.js`, and
// `../auth/signup.js`. Rather than monkeypatching ESM imports we rebuild
// the middleware with injected fakes — identical logic, swappable deps.

function buildVerifyAuth({ jwt, getJwtSecret, users }) {
  return (handler) => async (req, res) => {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(";").map((c) => c.trim());
      const tokenCookie = cookies.find((c) => c.startsWith("token="));
      if (tokenCookie) token = tokenCookie.substring(6);
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Unauthorized: Token expired", expired: true });
      }
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    const userEmail = decoded?.email;
    const userId   = decoded?.id;

    if (userEmail || userId) {
      const userExists = userEmail
        ? users.has(userEmail.toLowerCase())
        : Array.from(users.values()).some((u) => u.id === userId);

      if (!userExists) {
        return res.status(401).json({
          error: "Unauthorized: Session invalidated. Please log in again.",
          sessionInvalidated: true,
        });
      }
    }

    req.user = decoded;
    return handler(req, res);
  };
}

// ─── Test utilities ───────────────────────────────────────────────────────────

function mockReq({ cookies = {}, headers = {} } = {}) {
  return { cookies, headers, user: undefined };
}

function mockRes() {
  const res = { statusCode: 200, body: null, _handlerCalled: false };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json   = (body)  => { res.body = body;       return res; };
  return res;
}

function nextHandler(_req, res) { res._handlerCalled = true; }

/** jwt stub — always resolves to payload */
function jwtOk(payload) {
  return { verify: () => payload };
}

/** jwt stub — always throws with the given error.name */
function jwtFail(name) {
  return {
    verify: () => {
      const err = new Error(name);
      err.name = name;
      throw err;
    },
  };
}

const SECRET     = "test-secret";
const getSecret  = () => SECRET;

// ─── Runner ───────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// ─── Token extraction ─────────────────────────────────────────────────────────

console.log("\n── Token extraction ────────────────────────────────────────────");

await test("401 when no token source is present", async () => {
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({}), getJwtSecret: getSecret, users: new Map() });
  const res = mockRes();
  await verifyAuth(nextHandler)(mockReq(), res);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.error, /Missing authentication token/);
});

await test("reads token from req.cookies.token", async () => {
  const users = new Map([["a@b.com", {}]]);
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({ email: "a@b.com" }), getJwtSecret: getSecret, users });
  const req = mockReq({ cookies: { token: "tok" } });
  const res = mockRes();
  await verifyAuth(nextHandler)(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res._handlerCalled, true);
});

await test("parses token from raw cookie header string", async () => {
  const users = new Map([["c@d.com", {}]]);
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({ email: "c@d.com" }), getJwtSecret: getSecret, users });
  const req = mockReq({ headers: { cookie: "session=xyz; token=rawtoken; other=1" } });
  const res = mockRes();
  await verifyAuth(nextHandler)(req, res);
  assert.equal(res.statusCode, 200);
});

await test("reads token from Authorization: Bearer header", async () => {
  const users = new Map([["e@f.com", {}]]);
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({ email: "e@f.com" }), getJwtSecret: getSecret, users });
  const req = mockReq({ headers: { authorization: "Bearer bearertoken" } });
  const res = mockRes();
  await verifyAuth(nextHandler)(req, res);
  assert.equal(res.statusCode, 200);
});

await test("ignores Authorization header with non-Bearer scheme", async () => {
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({}), getJwtSecret: getSecret, users: new Map() });
  const req = mockReq({ headers: { authorization: "Basic dXNlcjpwYXNz" } });
  const res = mockRes();
  await verifyAuth(nextHandler)(req, res);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.error, /Missing authentication token/);
});

await test("req.cookies.token takes priority over Authorization header", async () => {
  const users = new Map([["g@h.com", {}]]);
  // Only "cookie-tok" is accepted; bearer token would throw
  const jwt = {
    verify: (token) => {
      if (token !== "cookie-tok") throw Object.assign(new Error(), { name: "JsonWebTokenError" });
      return { email: "g@h.com" };
    },
  };
  const verifyAuth = buildVerifyAuth({ jwt, getJwtSecret: getSecret, users });
  const req = mockReq({
    cookies: { token: "cookie-tok" },
    headers: { authorization: "Bearer bad-token" },
  });
  const res = mockRes();
  await verifyAuth(nextHandler)(req, res);
  assert.equal(res.statusCode, 200);
});

// ─── JWT verification ─────────────────────────────────────────────────────────

console.log("\n── JWT verification ────────────────────────────────────────────");

await test("401 + expired:true for TokenExpiredError", async () => {
  const verifyAuth = buildVerifyAuth({ jwt: jwtFail("TokenExpiredError"), getJwtSecret: getSecret, users: new Map() });
  const res = mockRes();
  await verifyAuth(nextHandler)(mockReq({ cookies: { token: "t" } }), res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.expired, true);
  assert.match(res.body.error, /Token expired/);
});

await test("401 for JsonWebTokenError (tampered signature)", async () => {
  const verifyAuth = buildVerifyAuth({ jwt: jwtFail("JsonWebTokenError"), getJwtSecret: getSecret, users: new Map() });
  const res = mockRes();
  await verifyAuth(nextHandler)(mockReq({ cookies: { token: "t" } }), res);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.error, /Invalid token/);
  assert.equal(res.body.expired, undefined);
});

await test("401 for NotBeforeError (nbf claim in the future)", async () => {
  const verifyAuth = buildVerifyAuth({ jwt: jwtFail("NotBeforeError"), getJwtSecret: getSecret, users: new Map() });
  const res = mockRes();
  await verifyAuth(nextHandler)(mockReq({ headers: { authorization: "Bearer t" } }), res);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.error, /Invalid token/);
});

// ─── User-store lookup ────────────────────────────────────────────────────────

console.log("\n── User-store lookup ───────────────────────────────────────────");

await test("passes through when email matches users Map", async () => {
  const payload = { email: "ada@example.com" };
  const users   = new Map([["ada@example.com", {}]]);
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk(payload), getJwtSecret: getSecret, users });
  const req = mockReq({ cookies: { token: "t" } });
  const res = mockRes();
  await verifyAuth(nextHandler)(req, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(req.user, payload);
});

await test("email lookup is case-insensitive", async () => {
  const users = new Map([["ada@example.com", {}]]);
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({ email: "ADA@EXAMPLE.COM" }), getJwtSecret: getSecret, users });
  const res = mockRes();
  await verifyAuth(nextHandler)(mockReq({ cookies: { token: "t" } }), res);
  assert.equal(res.statusCode, 200);
});

await test("401 sessionInvalidated when user not in store (cold-start scenario)", async () => {
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({ email: "ghost@example.com" }), getJwtSecret: getSecret, users: new Map() });
  const res = mockRes();
  await verifyAuth(nextHandler)(mockReq({ cookies: { token: "t" } }), res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.sessionInvalidated, true);
  assert.match(res.body.error, /Session invalidated/);
});

await test("falls back to id lookup when payload has no email", async () => {
  const users = new Map([["u@x.com", { id: "user-42" }]]);
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({ id: "user-42" }), getJwtSecret: getSecret, users });
  const res = mockRes();
  await verifyAuth(nextHandler)(mockReq({ cookies: { token: "t" } }), res);
  assert.equal(res.statusCode, 200);
});

await test("401 sessionInvalidated when id not found in store", async () => {
  const users = new Map([["u@x.com", { id: "user-42" }]]);
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({ id: "user-99" }), getJwtSecret: getSecret, users });
  const res = mockRes();
  await verifyAuth(nextHandler)(mockReq({ cookies: { token: "t" } }), res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.sessionInvalidated, true);
});

await test("skips user-store check when payload has neither email nor id", async () => {
  // Tokens with only non-identity claims (e.g. service tokens) must pass through
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({ role: "service", iat: 1000 }), getJwtSecret: getSecret, users: new Map() });
  const req = mockReq({ cookies: { token: "t" } });
  const res = mockRes();
  await verifyAuth(nextHandler)(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(req.user.role, "service");
});

// ─── req.user assignment ──────────────────────────────────────────────────────

console.log("\n── req.user assignment ─────────────────────────────────────────");

await test("sets req.user to the full decoded payload on success", async () => {
  const payload = { email: "z@z.com", role: "organizer", exp: 9999999999 };
  const users   = new Map([["z@z.com", {}]]);
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk(payload), getJwtSecret: getSecret, users });
  const req = mockReq({ cookies: { token: "t" } });
  await verifyAuth(nextHandler)(req, mockRes());
  assert.deepEqual(req.user, payload);
});

await test("req.user remains undefined when token is missing", async () => {
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({}), getJwtSecret: getSecret, users: new Map() });
  const req = mockReq();
  await verifyAuth(nextHandler)(req, mockRes());
  assert.equal(req.user, undefined);
});

await test("req.user remains undefined when token is invalid", async () => {
  const verifyAuth = buildVerifyAuth({ jwt: jwtFail("JsonWebTokenError"), getJwtSecret: getSecret, users: new Map() });
  const req = mockReq({ cookies: { token: "bad" } });
  await verifyAuth(nextHandler)(req, mockRes());
  assert.equal(req.user, undefined);
});

await test("req.user remains undefined when session is invalidated", async () => {
  const verifyAuth = buildVerifyAuth({ jwt: jwtOk({ email: "gone@x.com" }), getJwtSecret: getSecret, users: new Map() });
  const req = mockReq({ cookies: { token: "t" } });
  await verifyAuth(nextHandler)(req, mockRes());
  assert.equal(req.user, undefined);
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(60)}`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests.`);
if (failed > 0) process.exit(1);