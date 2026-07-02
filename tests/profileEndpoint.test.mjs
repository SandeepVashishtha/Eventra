process.env.ALLOWED_ORIGIN = "http://localhost:3000";

import "./helpers/authTestEnv.mjs";
import assert from "node:assert/strict";
const { default: profileHandler } = await import("../api/users/profile.js");
const { default: signupHandler } = await import("../api/auth/signup.js");

const createResponse = () => {
  const headers = {};
  const response = {
    statusCode: 200,
    body: null,
    headers,
    status(code) {
      this.statusCode = code;
      return this;
    },
    set(key, value) {
      if (typeof key === "object") {
        Object.assign(this.headers, key);
      } else {
        this.headers[key] = value;
      }
      return this;
    },
    setHeader(key, value) {
      this.headers[key] = value;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      return this;
    },
  };

  return response;
};

const createRequest = (method, { headers = {}, cookies = {}, body = null } = {}) => ({
  method,
  headers,
  cookies,
  body,
});

const extractTokenFromSetCookie = (setCookieHeader = "") => {
  const tokenCookie = String(setCookieHeader)
    .split(";")
    .find((part) => part.trim().startsWith("token="));

  return tokenCookie?.trim().substring("token=".length) || null;
};

const createTestUser = async () => {
  const req = createRequest("POST", {
    body: {
      firstName: "Profile",
      lastName: "Tester",
      email: "profile.endpoint@example.com",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    },
  });
  const res = createResponse();
  await signupHandler(req, res);
  return {
    ...res.body,
    token: extractTokenFromSetCookie(res.headers["Set-Cookie"]),
  };
};

console.log("Running profile endpoint tests...");

const createdUser = await createTestUser();
assert.ok(createdUser.token, "Signup should set an HttpOnly token cookie");

// Test 1: Restores profile from HttpOnly cookie token
{
  const req = createRequest("GET", {
    headers: {
      cookie: `theme=dark; token=${encodeURIComponent(createdUser.token)}`,
    },
  });
  const res = createResponse();
  await profileHandler(req, res);

  assert.equal(res.statusCode, 200, "Should return 200 with a valid cookie token");
  assert.equal(res.body.email, "profile.endpoint@example.com", "Should return the user's email");
  assert.equal(res.body.firstName, "Profile", "Should return stored profile details");
  assert.ok(Array.isArray(res.body.roles), "Should return roles array");
  assert.ok(Array.isArray(res.body.permissions), "Should return permissions array");
  assert.equal(res.body.password, undefined, "Should not expose password hashes");
  console.log("✓ Test 1: Restores profile from cookie token");
}

// Test 2: Restores profile from Bearer token when no auth cookie exists
{
  const req = createRequest("GET", {
    headers: {
      cookie: "theme=dark",
      Authorization: `Bearer ${createdUser.token}`,
    },
  });
  const res = createResponse();
  await profileHandler(req, res);

  assert.equal(res.statusCode, 200, "Should return 200 with a valid bearer token");
  assert.equal(res.body.username, "profile.endpoint@example.com", "Should return username");
  console.log("✓ Test 2: Restores profile from Bearer token fallback");
}

// Test 3: Missing token returns 401
{
  const req = createRequest("GET");
  const res = createResponse();
  await profileHandler(req, res);

  assert.equal(res.statusCode, 401, "Should return 401 with no token");
  assert.ok(res.body.error.includes("Missing authentication token"), "Should describe missing token");
  console.log("✓ Test 3: Missing token returns 401");
}

// Test 4: Invalid token returns 401
{
  const req = createRequest("GET", {
    headers: {
      Authorization: "Bearer invalid-token",
    },
  });
  const res = createResponse();
  await profileHandler(req, res);

  assert.equal(res.statusCode, 401, "Should return 401 with an invalid token");
  assert.ok(res.body.error.includes("Invalid token"), "Should describe invalid token");
  console.log("✓ Test 4: Invalid token returns 401");
}

// Test 5: Non-GET methods return 405
{
  const req = createRequest("POST");
  const res = createResponse();
  await profileHandler(req, res);

  assert.equal(res.statusCode, 405, "Should reject non-GET methods");
  console.log("✓ Test 5: Non-GET methods return 405");
}

console.log("All profile endpoint tests passed!");
