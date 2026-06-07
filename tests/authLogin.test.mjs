import assert from "node:assert/strict";

const loginModule = await import("../api/auth/login.js");
const login = loginModule.default;
const { loginRateLimiter } = await import("../api/lib/rateLimiter.js");

function makeRes() {
  return {
    statusCode: null,
    headers: {},
    body: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function makeReq({ method = "POST", body = {}, ip = "5.5.5.5" } = {}) {
  return {
    method,
    body,
    headers: { "x-real-ip": ip },
    socket: { remoteAddress: ip },
  };
}

const deps = {
  findUserByEmail: async (email) =>
    email === "user@example.com"
      ? { id: 1, email, password: "stored-hash" }
      : null,
  comparePassword: async (plain, hash) =>
    plain === "correct-password" && hash === "stored-hash",
  issueToken: () => "test-token",
};

// --- rejects non-POST methods ---
{
  const res = makeRes();
  await login(makeReq({ method: "GET" }), res, deps);
  assert.equal(res.statusCode, 405, "GET request rejected with 405");
}

// --- valid credentials succeed ---
{
  loginRateLimiter.reset();
  const res = makeRes();
  await login(
    makeReq({ body: { email: "user@example.com", password: "correct-password" }, ip: "10.0.0.1" }),
    res,
    deps
  );
  assert.equal(res.statusCode, 200, "valid login returns 200");
  assert.equal(res.body.token, undefined, "token not in response body");
  assert.ok(res.headers["Set-Cookie"].includes("token=test-token"), "token set in Set-Cookie header");
  assert.equal(res.body.user.email, "user@example.com", "user echoed back");
}

// --- wrong password returns generic 401 ---
{
  loginRateLimiter.reset();
  const res = makeRes();
  await login(
    makeReq({ body: { email: "user@example.com", password: "wrong" }, ip: "10.0.0.2" }),
    res,
    deps
  );
  assert.equal(res.statusCode, 401, "wrong password returns 401");
  assert.equal(
    res.body.error,
    "Invalid email or password",
    "generic error prevents account enumeration"
  );
}

// --- unknown email returns same generic 401 ---
{
  loginRateLimiter.reset();
  const res = makeRes();
  await login(
    makeReq({ body: { email: "ghost@example.com", password: "whatever" }, ip: "10.0.0.3" }),
    res,
    deps
  );
  assert.equal(res.statusCode, 401, "unknown email returns 401");
  assert.equal(
    res.body.error,
    "Invalid email or password",
    "same message for unknown email"
  );
}

// --- missing fields return 400 ---
{
  loginRateLimiter.reset();
  const res = makeRes();
  await login(makeReq({ body: { email: "user@example.com" }, ip: "10.0.0.4" }), res, deps);
  assert.equal(res.statusCode, 400, "missing password returns 400");
}

// --- rate limiting blocks the 6th attempt from one IP before bcrypt ---
{
  loginRateLimiter.reset();
  const ip = "203.0.113.7";
  let bcryptCalls = 0;
  const countingDeps = {
    findUserByEmail: async () => ({ id: 1, email: "user@example.com", password: "h" }),
    comparePassword: async () => {
      bcryptCalls += 1;
      return false;
    },
  };

  let lastRes;
  for (let i = 0; i < 6; i += 1) {
    lastRes = makeRes();
    await login(
      makeReq({ body: { email: "user@example.com", password: "x" }, ip }),
      lastRes,
      countingDeps
    );
  }

  assert.equal(lastRes.statusCode, 429, "6th attempt rate limited");
  assert.equal(
    bcryptCalls,
    5,
    "password comparison runs at most 5 times before limiter blocks"
  );
}

// --- successful login resets the IP counter ---
{
  loginRateLimiter.reset();
  const ip = "203.0.113.8";

  // Two failed attempts
  for (let i = 0; i < 2; i += 1) {
    const res = makeRes();
    await login(
      makeReq({ body: { email: "user@example.com", password: "wrong" }, ip }),
      res,
      deps
    );
  }

  // Successful attempt resets the counter
  const successRes = makeRes();
  await login(
    makeReq({ body: { email: "user@example.com", password: "correct-password" }, ip }),
    successRes,
    deps
  );
  assert.equal(successRes.statusCode, 200, "successful login after failures");

  // Counter cleared, so further attempts are allowed again
  const afterRes = makeRes();
  await login(
    makeReq({ body: { email: "user@example.com", password: "wrong" }, ip }),
    afterRes,
    deps
  );
  assert.notEqual(
    afterRes.statusCode,
    429,
    "counter reset after successful login"
  );
}

// --- fails closed when dependencies are not wired ---
{
  loginRateLimiter.reset();
  const res = makeRes();
  await login(
    makeReq({ body: { email: "user@example.com", password: "correct-password" }, ip: "10.0.0.9" }),
    res,
    {}
  );
  assert.equal(res.statusCode, 503, "missing deps fail closed with 503");
}

console.log("auth login tests passed ✓");
