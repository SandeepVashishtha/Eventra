import "./helpers/authTestEnv.mjs";

import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

import { verifyAuth } from "../api/middleware/auth.js";
import { getJwtSecret } from "../api/auth/jwt-config.js";
import { users } from "../api/auth/signup.js";

// ---------------------------------------------------------------------------
// Mock Response Helper
// ---------------------------------------------------------------------------

const createResponse = () => ({
  statusCode: 200,
  body: null,
  headers: {},

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

  json(body) {
    this.body = body;
    return this;
  },
});

// ---------------------------------------------------------------------------
// Mock Request Helper
// ---------------------------------------------------------------------------

const createRequest = (headers = {}, cookies = {}) => ({
  headers,
  cookies,
});

// ---------------------------------------------------------------------------
// Protected Handler
// ---------------------------------------------------------------------------

let protectedHandlerCalled = false;

const protectedHandler = async (req, res) => {
  protectedHandlerCalled = true;

  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

const authenticatedHandler = verifyAuth(protectedHandler);

const resetHandlerState = () => {
  protectedHandlerCalled = false;
};

console.log("Running JWT security tests...");

// ---------------------------------------------------------------------------
// Test 1: Missing JWT
// ---------------------------------------------------------------------------

{
  resetHandlerState();

  const req = createRequest();
  const res = createResponse();

  await authenticatedHandler(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(
    res.body.error,
    "Unauthorized: Missing authentication token"
  );
  assert.equal(protectedHandlerCalled, false);

  console.log("✓ Test 1: Missing JWT is rejected");
}

// ---------------------------------------------------------------------------
// Test 2: Malformed JWT
// ---------------------------------------------------------------------------

{
  resetHandlerState();

  const req = createRequest({
    authorization: "Bearer malformed-token",
  });

  const res = createResponse();

  await authenticatedHandler(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(
    res.body.error,
    "Unauthorized: Invalid token"
  );
  assert.equal(protectedHandlerCalled, false);

  console.log("✓ Test 2: Malformed JWT is rejected");
}

// ---------------------------------------------------------------------------
// Test 3: Expired JWT
// ---------------------------------------------------------------------------

{
  resetHandlerState();

  const expiredToken = jwt.sign(
    {
      id: "expired-user",
      email: "expired@example.com",
    },
    getJwtSecret(),
    {
      expiresIn: -60,
    }
  );

  const req = createRequest({
    authorization: `Bearer ${expiredToken}`,
  });

  const res = createResponse();

  await authenticatedHandler(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(
    res.body.error,
    "Unauthorized: Token expired"
  );
  assert.equal(res.body.expired, true);
  assert.equal(protectedHandlerCalled, false);

  console.log("✓ Test 3: Expired JWT is rejected");
}

// ---------------------------------------------------------------------------
// Test 4: Invalid JWT Signature
// ---------------------------------------------------------------------------

{
  resetHandlerState();

  const invalidSignatureToken = jwt.sign(
    {
      id: "attacker",
      email: "attacker@example.com",
    },
    "incorrect-signing-secret",
    {
      expiresIn: "1h",
    }
  );

  const req = createRequest({
    authorization: `Bearer ${invalidSignatureToken}`,
  });

  const res = createResponse();

  await authenticatedHandler(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(
    res.body.error,
    "Unauthorized: Invalid token"
  );
  assert.equal(protectedHandlerCalled, false);

  console.log("✓ Test 4: JWT with invalid signature is rejected");
}

// ---------------------------------------------------------------------------
// Test 5: Missing Bearer Prefix
// ---------------------------------------------------------------------------

{
  resetHandlerState();

  const token = jwt.sign(
    {
      id: "test-user",
      email: "test@example.com",
    },
    getJwtSecret(),
    {
      expiresIn: "1h",
    }
  );

  const req = createRequest({
    authorization: token,
  });

  const res = createResponse();

  await authenticatedHandler(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(
    res.body.error,
    "Unauthorized: Missing authentication token"
  );
  assert.equal(protectedHandlerCalled, false);

  console.log("✓ Test 5: Authorization header without Bearer prefix is rejected");
}

// ---------------------------------------------------------------------------
// Test 6: Valid JWT Allows Protected Handler
// ---------------------------------------------------------------------------

{
  resetHandlerState();

  const email = "jwt.security@example.com";

  users.set(email, {
    id: "jwt-security-user",
    email,
  });

  const validToken = jwt.sign(
    {
      id: "jwt-security-user",
      email,
    },
    getJwtSecret(),
    {
      expiresIn: "1h",
    }
  );

  const req = createRequest({
    authorization: `Bearer ${validToken}`,
  });

  const res = createResponse();

  await authenticatedHandler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(req.user.email, email);
  assert.equal(protectedHandlerCalled, true);

  users.delete(email);

  console.log("✓ Test 6: Valid JWT allows protected route access");
}

// ---------------------------------------------------------------------------
// Test 7: Valid JWT for Missing User Is Rejected
// ---------------------------------------------------------------------------

{
  resetHandlerState();

  const token = jwt.sign(
    {
      id: "missing-user",
      email: "missing-user@example.com",
    },
    getJwtSecret(),
    {
      expiresIn: "1h",
    }
  );

  const req = createRequest({
    authorization: `Bearer ${token}`,
  });

  const res = createResponse();

  await authenticatedHandler(req, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.sessionInvalidated, true);
  assert.equal(protectedHandlerCalled, false);

  console.log("✓ Test 7: JWT referencing missing user is rejected");
}

console.log("\n✅ All JWT security tests passed!");