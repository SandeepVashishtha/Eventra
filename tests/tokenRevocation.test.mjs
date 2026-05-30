import "./helpers/authTestEnv.mjs";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const { createTokenRevocationService, tokenRevocationService } = await import("../api/auth/token-revocation.js");
const { verifyAuth } = await import("../api/middleware/auth.js");
const { users } = await import("../api/auth/signup.js");

const JWT_SECRET = process.env.JWT_SECRET;

const sharedState = new Map();

users.set("test@example.com", {
  id: "user-123",
  email: "test@example.com",
  username: "test@example.com",
  roles: ["USER"],
  permissions: ["events:view"],
});

const createSharedBackend = () => ({
  async revoke(key, ttlSeconds) {
    sharedState.set(key, Date.now() + ttlSeconds * 1000);
  },
  async isRevoked(key) {
    const expiresAt = sharedState.get(key);
    if (!expiresAt) {
      return false;
    }

    if (expiresAt <= Date.now()) {
      sharedState.delete(key);
      return false;
    }

    return true;
  },
  async clear() {
    sharedState.clear();
  },
});

const instanceA = createTokenRevocationService(createSharedBackend());
const instanceB = createTokenRevocationService(createSharedBackend());

const createToken = (payload = {}) =>
  jwt.sign(
    {
      id: "user-123",
      email: "test@example.com",
      roles: ["USER"],
      permissions: ["events:view"],
      jti: crypto.randomUUID(),
      ...payload,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

const createResponse = () => ({
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
  set(key, value) {
    if (typeof key === "object") {
      Object.assign(this.headers, key);
    } else {
      this.headers[key] = value;
    }
    return this;
  },
});

const createRequest = ({ authorization }) => ({
  method: "GET",
  headers: { authorization },
  cookies: {},
});

console.log("Running distributed token revocation tests...");

await instanceA.clearForTests();

{
  const token = createToken();
  const decoded = jwt.decode(token);

  await instanceA.revokeToken(token, decoded);

  assert.equal(await instanceB.isTokenRevoked(token, decoded), true, "A revoked token must be visible to a second instance");
}

{
  const token = createToken();
  const res = createResponse();
  const handler = verifyAuth(async (_req, response) => response.status(200).json({ ok: true }));

  await tokenRevocationService.clearForTests();

  const revokedDecoded = jwt.decode(token);
  await tokenRevocationService.revokeToken(token, revokedDecoded);

  await handler(createRequest({ authorization: `Bearer ${token}` }), res);

  assert.equal(res.statusCode, 401, "Revoked token should not reach protected endpoints");
  assert.equal(res.body?.revoked, true, "Middleware should mark revoked tokens explicitly");
}

console.log("✅ Distributed token revocation tests passed!");
