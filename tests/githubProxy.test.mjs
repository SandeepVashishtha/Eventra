import "./helpers/authTestEnv.mjs";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
const { default: handler } = await import("../api/github-proxy.js");
const { users } = await import("../api/auth/signup.js");

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

const DEV_JWT_SECRET = process.env.JWT_SECRET;

const makeToken = (payload = {}) =>
  jwt.sign({ id: "user-test-1", email: "test@example.com", ...payload }, DEV_JWT_SECRET, {
    expiresIn: "1h",
  });

const createRequest = (query, token) => ({
  query,
  headers: { authorization: token ? `Bearer ${token}` : undefined },
  cookies: {},
  user: null,
});

const createResponse = () => {
  const response = {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
  };

  return response;
};

// ---------------------------------------------------------------------------
// Mock global fetch
// ---------------------------------------------------------------------------

let fetchCalls = [];
globalThis.fetch = async (url, options) => {
  fetchCalls.push({ url, options });
  return {
    status: 200,
    headers: { get: () => null },
    json: async () => ({ ok: true }),
  };
};

process.env.GITHUB_TOKEN = "test-token";

users.set("test@example.com", {
  id: "user-test-1",
  email: "test@example.com",
  username: "test@example.com",
  roles: ["USER"],
  permissions: ["events:view"],
});

users.set("ratelimit@example.com", {
  id: "user-rate-limit-test",
  email: "ratelimit@example.com",
  username: "ratelimit@example.com",
  roles: ["USER"],
  permissions: ["events:view"],
});

// ---------------------------------------------------------------------------
// 1. Unauthenticated requests must be rejected with 401
// ---------------------------------------------------------------------------

{
  const res = createResponse();
  await handler(createRequest({ path: "/repos/Eventra/Eventra/contributors" }, null), res);
  assert.equal(res.statusCode, 401, "Missing token should return 401");
  assert.equal(fetchCalls.length, 0, "Unauthenticated request must not reach GitHub API");
}

// ---------------------------------------------------------------------------
// 2. Blocked paths are rejected with 400 (even when authenticated)
// ---------------------------------------------------------------------------

const blockedPaths = [
  "@evil.example.com/steal",
  "/repos/owner/repo/../secret",
  "/repos/owner/repo/issues",
  "https://evil.example.com/steal",
];

const authToken = makeToken();

for (const path of blockedPaths) {
  const res = createResponse();
  fetchCalls = [];
  await handler(createRequest({ path }, authToken), res);

  assert.equal(res.statusCode, 400, `Blocked path "${path}" should return 400`);
  assert.equal(fetchCalls.length, 0, `Blocked path "${path}" must not reach GitHub API`);
}

// ---------------------------------------------------------------------------
// 3. Valid authenticated requests reach the GitHub API
// ---------------------------------------------------------------------------

fetchCalls = [];

const contributorsResponse = createResponse();
await handler(
  createRequest({ path: "/repos/Eventra/Eventra/contributors", per_page: "100", page: "2" }, authToken),
  contributorsResponse
);

assert.equal(contributorsResponse.statusCode, 200);
assert.equal(fetchCalls.length, 1);
assert.equal(
  fetchCalls[0].url,
  "https://api.github.com/repos/Eventra/Eventra/contributors?per_page=100&page=2"
);
assert.equal(fetchCalls[0].options.headers.Authorization, "token test-token");

const repoResponse = createResponse();
await handler(createRequest({ path: "/repos/Eventra/Eventra" }, authToken), repoResponse);

assert.equal(repoResponse.statusCode, 200);
assert.equal(fetchCalls.length, 2);
assert.equal(fetchCalls[1].url, "https://api.github.com/repos/Eventra/Eventra");

const usersResponse = createResponse();
await handler(createRequest({ path: "/users/octocat" }, authToken), usersResponse);

assert.equal(usersResponse.statusCode, 200);
assert.equal(fetchCalls.length, 3);
assert.equal(fetchCalls[2].url, "https://api.github.com/users/octocat");

// ---------------------------------------------------------------------------
// 4. Per-user rate limit: 61st request within the window returns 429
//
// Use a distinct user ID so this test does not share quota with the requests
// already made above for the same user.
// ---------------------------------------------------------------------------

fetchCalls = [];

const rateLimitToken = makeToken({ id: "user-rate-limit-test", email: "ratelimit@example.com" });

for (let i = 0; i < 60; i++) {
  const res = createResponse();
  await handler(createRequest({ path: "/repos/Eventra/Eventra" }, rateLimitToken), res);
  assert.equal(res.statusCode, 200, `Request ${i + 1} should succeed`);
}

const exceededResponse = createResponse();
await handler(
  createRequest({ path: "/repos/Eventra/Eventra" }, rateLimitToken),
  exceededResponse
);

assert.equal(exceededResponse.statusCode, 429, "61st request should be rate limited (429)");
assert.ok(
  exceededResponse.body?.error?.toLowerCase().includes("too many"),
  "Rate limit error message should be descriptive"
);

console.log("All githubProxy tests passed.");
