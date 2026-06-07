import "./helpers/authTestEnv.mjs";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { verifyAuth } from "../api/middleware/auth.js";
import { getJwtSecret } from "../api/auth/jwt-config.js";
import { users, usersById, usersByUsername } from "../api/auth/signup.js";
import { AUTH_TEST_ALLOWED_ORIGIN } from "./helpers/authTestEnv.mjs";

const makeToken = (payload) => jwt.sign(payload, getJwtSecret(), { expiresIn: "1h" });

const createRequest = (token) => ({
  method: "GET",
  headers: {
    authorization: `Bearer ${token}`,
    origin: AUTH_TEST_ALLOWED_ORIGIN,
  },
  cookies: {},
});

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

const protectedHandler = verifyAuth(async (req, res) => {
  return res.status(200).json({ ok: true, userId: req.user.id });
});

const resetUserStores = () => {
  users.clear();
  usersById.clear();
  usersByUsername.clear();
};

const seedUser = ({ id, email, isActive = true }) => {
  const user = {
    id,
    email,
    username: email,
    roles: ["USER"],
    permissions: [],
    isActive,
  };

  users.set(email.toLowerCase(), user);
  usersById.set(id, user);
  usersByUsername.set(email.toLowerCase(), user);

  return user;
};

resetUserStores();

// Baseline: active users with valid token can access protected endpoints.
{
  const user = seedUser({ id: "active-user", email: "active@example.com", isActive: true });
  const token = makeToken({ id: user.id, email: user.email, roles: user.roles });
  const req = createRequest(token);
  const res = createResponse();

  await protectedHandler(req, res);

  assert.equal(res.statusCode, 200, "Active user should be authorized");
  assert.equal(res.body?.ok, true);
}

// Deleted user: a previously valid token must now be rejected.
{
  const user = seedUser({ id: "deleted-user", email: "deleted@example.com", isActive: true });
  const token = makeToken({ id: user.id, email: user.email, roles: user.roles });

  users.delete(user.email.toLowerCase());
  usersById.delete(user.id);
  usersByUsername.delete(user.email.toLowerCase());

  const req = createRequest(token);
  const res = createResponse();
  await protectedHandler(req, res);

  assert.equal(res.statusCode, 401, "Deleted user token must be rejected");
  assert.equal(res.body?.error, "Unauthorized: User not found");
  assert.equal(
    users.has(user.email.toLowerCase()),
    false,
    "Middleware must not recreate deleted users"
  );
  assert.equal(usersById.has(user.id), false, "Deleted user ID must remain absent");
}

// Inactive user: valid token cannot bypass account suspension.
{
  const user = seedUser({ id: "inactive-user", email: "inactive@example.com", isActive: false });
  const token = makeToken({ id: user.id, email: user.email, roles: user.roles });

  const req = createRequest(token);
  const res = createResponse();
  await protectedHandler(req, res);

  assert.equal(res.statusCode, 401, "Inactive user token must be rejected");
  assert.equal(res.body?.error, "Unauthorized: User inactive");
}

// Cold start: empty in-memory stores must not accept orphaned tokens.
{
  resetUserStores();

  const token = makeToken({
    id: "cold-start-user",
    email: "coldstart@example.com",
    roles: ["USER"],
  });

  const req = createRequest(token);
  const res = createResponse();
  await protectedHandler(req, res);

  assert.equal(res.statusCode, 401, "Cold-start orphaned token must be rejected");
  assert.equal(res.body?.error, "Unauthorized: User not found");
  assert.equal(users.size, 0, "Middleware must not reconstruct users during cold start");
}

// Token missing identity claims: must be rejected fail-closed.
{
  resetUserStores();
  const token = makeToken({ roles: ["ADMIN"] });
  const req = createRequest(token);
  const res = createResponse();
  await protectedHandler(req, res);

  assert.equal(res.statusCode, 401, "Token without identity claims must be rejected");
  assert.equal(res.body?.error, "Unauthorized: Invalid token payload");
}

resetUserStores();
console.log("authMiddleware tests passed.");
