import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("../../api/auth/_user-storage.js", () => ({
  createUser: vi.fn().mockResolvedValue({}),
  getUserByEmail: vi.fn().mockResolvedValue(null),
  isStorageHealthy: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../api/auth/_jwt-config.js", () => ({
  getJwtSecret: () => "test-secret",
  JWT_EXPIRES_IN: "1h",
  JWT_COOKIE_MAX_AGE_SECONDS: 3600,
}));

vi.mock("../../api/auth/_storage-config.js", () => ({
  assertPersistentStorageConfigured: () => {},
}));

vi.mock("../../api/_lib/rateLimiter.js", () => ({
  signupRateLimiter: {
    checkAsync: vi.fn().mockResolvedValue({ allowed: true, remaining: 4, resetAt: Date.now() + 60000 }),
  },
}));

vi.mock("../../api/auth/_cors.js", () => ({
  buildCorsHeaders: () => ({ "access-control-allow-origin": "*" }),
  corsResponse: (req, res, status, data) => {
    if (typeof res.set === "function") res.set(buildCorsHeaders());
    res.status(status).json(data);
    return res;
  },
}));

import handler from "../../api/auth/signup.js";
import { createUser, getUserByEmail, isStorageHealthy } from "../../api/auth/_user-storage.js";
import { signupRateLimiter } from "../../api/_lib/rateLimiter.js";

let req, res;

beforeEach(() => {
  req = {
    method: "POST",
    url: "/api/auth/signup",
    headers: { "content-type": "application/json", "content-length": "200" },
    body: {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "Passw0rd!",
      confirmPassword: "Passw0rd!",
    },
  };
  res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    end: vi.fn().mockReturnThis(),
  };
  vi.clearAllMocks();
});

describe("signup handler", () => {
  test("returns 405 for non-POST methods", async () => {
    req.method = "GET";
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  test("returns 400 when body is missing", async () => {
    req.body = null;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  test("returns 400 when body is not an object", async () => {
    req.body = "string";
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 for empty body object", async () => {
    req.body = {};
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 413 for too large payload", async () => {
    req.headers["content-length"] = "99999";
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(413);
  });

  test("returns 400 with validation error when email is missing", async () => {
    req.body.email = "";
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 with validation error when password is too short", async () => {
    req.body.password = "Ab1!";
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when passwords do not match", async () => {
    req.body.confirmPassword = "Different1!";
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 for invalid email format after basic validation", async () => {
    req.body.email = "not-an-email";
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    const callArgs = res.json.mock.calls[0][0];
    expect(callArgs.error).toContain("Invalid");
  });

  test("returns 409 when email already exists", async () => {
    getUserByEmail.mockResolvedValue({ id: "existing" });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("returns 429 when rate limited", async () => {
    signupRateLimiter.checkAsync.mockResolvedValue({ allowed: false, remaining: 0, resetAt: Date.now() + 60000 });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  test("returns 201 on successful signup", async () => {
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const callArgs = res.json.mock.calls[0][0];
    expect(callArgs.message).toBe("Account created successfully");
    expect(callArgs.firstName).toBe("John");
    expect(callArgs.lastName).toBe("Doe");
    expect(callArgs.email).toBe("john@example.com");
  });

  test("stores normalized email", async () => {
    req.body.email = "  John@Example.COM  ";
    await handler(req, res);
    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({ email: "john@example.com" }));
  });

  test("creates user with correct default roles", async () => {
    await handler(req, res);
    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
      roles: ["USER"],
      permissions: expect.arrayContaining(["events:view", "events:register"]),
    }));
  });

  test("creates user with hashed password (not plaintext)", async () => {
    await handler(req, res);
    const created = createUser.mock.calls[0][0];
    expect(created.password).not.toBe("Passw0rd!");
    expect(created.password).toContain("$2b$");
  });

  test("sets auth cookie on successful signup", async () => {
    await handler(req, res);
    const setCall = res.set.mock.calls.find(c => c[0] === "Set-Cookie" || c[0]["Set-Cookie"]);
    if (setCall) {
      const cookie = setCall[0]["Set-Cookie"] || setCall[1];
      expect(cookie).toContain("token=");
    }
  });

  test("returns 500 when storage is unhealthy", async () => {
    isStorageHealthy.mockResolvedValue(false);
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("handles storage errors gracefully", async () => {
    createUser.mockRejectedValue(new Error("DB connection failed"));
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("validates firstName < 2 chars", async () => {
    req.body.firstName = "A";
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining("First name") }));
  });

  test("validates firstName > 50 chars", async () => {
    req.body.firstName = "A".repeat(51);
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("trims whitespace from firstName", async () => {
    req.body.firstName = "  Alice  ";
    req.body.lastName = "  Smith  ";
    await handler(req, res);
    expect(createUser).toHaveBeenCalledWith(expect.objectContaining({
      firstName: "Alice",
      lastName: "Smith",
    }));
  });
});
