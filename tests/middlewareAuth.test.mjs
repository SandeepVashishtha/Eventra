import "./helpers/authTestEnv.mjs";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { verifyAuth } from "../api/middleware/auth.js";
import { getJwtSecret } from "../api/auth/jwt-config.js";
import { users, usersById } from "../api/auth/signup.js";

// Mock Response Helper
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

// Mock Request Helper
const createRequest = (token, cookies = null) => {
  const headers = {};
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  const req = {
    headers,
    cookies: cookies || {},
  };
  return req;
};

const JWT_SECRET = getJwtSecret();

console.log("Running Auth Middleware unit tests...");

// Setup mock handler
const mockHandler = (req, res) => {
  return res.status(200).json({ success: true, user: req.user });
};
const wrappedHandler = verifyAuth(mockHandler);

// Clean up maps before running tests
users.clear();
usersById.clear();

// Test 1: Valid user can authenticate, and roles/permissions are loaded from the store
{
  const testUser = {
    id: "user-valid-1",
    email: "valid@example.com",
    username: "valid@example.com",
    roles: ["ORGANIZER"],
    permissions: ["events:create", "events:edit"],
    isActive: true,
  };
  users.set(testUser.email.toLowerCase(), testUser);
  usersById.set(testUser.id, testUser);

  const payload = {
    id: testUser.id,
    email: testUser.email,
    roles: ["USER"], // Token has "USER" role
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  const req = createRequest(token);
  const res = createResponse();

  await wrappedHandler(req, res);

  assert.equal(res.statusCode, 200, "Should allow authentication for a valid user");
  assert.equal(res.body.success, true);
  
  // Verify roles and permissions are loaded from the store, not the token payload
  assert.deepEqual(res.body.user.roles, ["ORGANIZER"], "Should load roles from store");
  assert.deepEqual(res.body.user.permissions, ["events:create", "events:edit"], "Should load permissions from store");
  console.log("✓ Test 1: Valid user authenticates, roles/permissions loaded from store");
}

// Test 2: Deleted user (does not exist in store) is rejected and NOT reconstructed
{
  const payload = {
    id: "user-deleted-1",
    email: "deleted@example.com",
    roles: ["USER"],
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  const req = createRequest(token);
  const res = createResponse();

  await wrappedHandler(req, res);

  assert.equal(res.statusCode, 401, "Should deny authentication for non-existent user");
  assert.equal(res.body.error, "Unauthorized: User account does not exist");
  
  // Ensure the user was NOT implicitly reconstructed in the maps
  assert.equal(users.has("deleted@example.com"), false, "Should not reconstruct deleted user");
  assert.equal(usersById.has("user-deleted-1"), false, "Should not reconstruct deleted user ID");
  console.log("✓ Test 2: Deleted user is rejected and not reconstructed");
}

// Test 3: Deactivated/Suspended user is rejected
{
  const testUser = {
    id: "user-suspended-1",
    email: "suspended@example.com",
    username: "suspended@example.com",
    roles: ["USER"],
    permissions: [],
    isActive: false, // suspended
  };
  users.set(testUser.email.toLowerCase(), testUser);
  usersById.set(testUser.id, testUser);

  const payload = {
    id: testUser.id,
    email: testUser.email,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  const req = createRequest(token);
  const res = createResponse();

  await wrappedHandler(req, res);

  assert.equal(res.statusCode, 401, "Should deny authentication for deactivated user");
  assert.equal(res.body.error, "Unauthorized: User account is deactivated or suspended");
  console.log("✓ Test 3: Suspended/deactivated user is rejected");
}

// Test 4: Role and permission changes are reflected immediately
{
  const testUser = {
    id: "user-role-change-1",
    email: "rolechange@example.com",
    username: "rolechange@example.com",
    roles: ["USER"],
    permissions: [],
    isActive: true,
  };
  users.set(testUser.email.toLowerCase(), testUser);
  usersById.set(testUser.id, testUser);

  const payload = {
    id: testUser.id,
    email: testUser.email,
    roles: ["USER"],
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

  // Now, update roles and permissions in the store
  testUser.roles = ["ADMIN"];
  testUser.permissions = ["admin:access"];

  const req = createRequest(token);
  const res = createResponse();

  await wrappedHandler(req, res);

  assert.equal(res.statusCode, 200, "Should allow access");
  assert.deepEqual(res.body.user.roles, ["ADMIN"], "Should reflect updated roles immediately");
  assert.deepEqual(res.body.user.permissions, ["admin:access"], "Should reflect updated permissions immediately");
  console.log("✓ Test 4: Role/permission changes are reflected immediately");
}

// Test 5: Invalid/expired tokens are rejected
{
  const expiredToken = jwt.sign({ id: "valid-1", email: "valid@example.com" }, JWT_SECRET, { expiresIn: "-1s" });
  const req1 = createRequest(expiredToken);
  const res1 = createResponse();

  await wrappedHandler(req1, res1);
  assert.equal(res1.statusCode, 401, "Expired token should be rejected");
  assert.equal(res1.body.error, "Unauthorized: Token expired");

  const req2 = createRequest("invalid-token-string");
  const res2 = createResponse();

  await wrappedHandler(req2, res2);
  assert.equal(res2.statusCode, 401, "Invalid token should be rejected");
  assert.equal(res2.body.error, "Unauthorized: Invalid token");
  console.log("✓ Test 5: Invalid and expired tokens are rejected");
}

console.log("\n✅ All Auth Middleware tests passed!");
