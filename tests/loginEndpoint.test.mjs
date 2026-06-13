/**
 * Tests for api/auth/login.js
 *
 * Verifies that the login handler does not throw an error and returns HTTP 401
 * for both incorrect password and non-existent users, preventing account enumeration.
 */

import "./helpers/authTestEnv.mjs";

import assert from "node:assert/strict";
import login from "../api/auth/login.js";

// Mock request and response builders
function mockReq(body) {
  return {
    method: "POST",
    body,
    headers: {
      "x-forwarded-for": "127.0.0.1",
    },
  };
}

function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    headers: {},
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  res.setHeader = (name, value) => {
    res.headers[name] = value;
    return res;
  };
  return res;
}

async function runTests() {
  // Test case 1: Registered user with wrong password -> 401
  {
    const req = mockReq({ usernameOrEmail: "registered@example.com", password: "wrong_password" });
    const res = mockRes();

    const deps = {
      findUserByEmail: async () => ({
        id: "123",
        email: "registered@example.com",
        password: "$2b$10$v18wNUUU7wTXyTbRPTFZTeze3aHS//qr4FKA9gu1E/GfNQqTsFfRG",
      }),
      comparePassword: async () => false,
    };

    await login(req, res, deps);

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: "Invalid credentials" });
  }

  // Test case 2: Unregistered user -> 401 (no 500 error)
  {
    const req = mockReq({ usernameOrEmail: "unregistered@example.com", password: "some_password" });
    const res = mockRes();

    const deps = {
      findUserByEmail: async () => null,
      comparePassword: async (plain, hash) => {
        // Simulating standard bcrypt behavior where an invalid/empty hash throws an error
        if (!hash || !hash.startsWith("$2")) {
          throw new Error("bcrypt: hash must be a valid bcrypt hash string");
        }
        return false;
      },
    };

    // This should run without throwing any error and return 401
    await login(req, res, deps);

    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: "Invalid credentials" });
  }

  console.log("loginEndpoint.test.mjs passed ✓");
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
