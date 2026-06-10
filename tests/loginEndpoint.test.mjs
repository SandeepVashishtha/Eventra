import { AUTH_TEST_ALLOWED_ORIGIN } from "./helpers/authTestEnv.mjs";
import assert from "node:assert/strict";
const { default: handler, users } = await import("../api/auth/login.js");

// ---------------------------------------------------------------------------
// Mock Response Helper
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Mock Request Helper
// ---------------------------------------------------------------------------

let requestCounter = 0;
const createRequest = (method, body, headers = {}) => {
  const finalHeaders = { origin: "http://localhost:3000", ...headers };
  if (!finalHeaders["x-forwarded-for"] && !finalHeaders["x-real-ip"]) {
    requestCounter += 1;
    finalHeaders["x-forwarded-for"] = `10.0.0.${requestCounter}`;
  }
  return {
    method,
    body,
    headers: finalHeaders,
  };
};

// ---------------------------------------------------------------------------
// Helper: Create a test user by calling signup first
// ---------------------------------------------------------------------------

const { default: signupHandler } = await import("../api/auth/signup.js");

const createTestUser = async (userData) => {
  const req = createRequest("POST", userData);
  const res = createResponse();
  await signupHandler(req, res);
  return { statusCode: res.statusCode, body: res.body };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

console.log("Running login endpoint tests...");

// Test 1: Successful login with email
{
  const userData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.login@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };
  await createTestUser(userData);

  const req = createRequest("POST", {
    usernameOrEmail: "john.login@example.com",
    password: "SecurePass123!",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 200, "Should return 200 on successful login");
  // Token must NOT appear in the JSON body — it is delivered only via HttpOnly cookie.
  assert.equal(res.body.token, undefined, "Token must not be exposed in the response body");
  assert.equal(res.body.tokenType, undefined, "tokenType must not be in body when using HttpOnly cookies");
  // HttpOnly Set-Cookie header must be present and correctly configured.
  const setCookie1 = res.headers["Set-Cookie"] || "";
  assert.ok(setCookie1.includes("token="), "Set-Cookie header must contain the token");
  assert.ok(setCookie1.includes("HttpOnly"), "Cookie must have HttpOnly flag");
  assert.ok(setCookie1.includes("SameSite=Strict"), "Cookie must have SameSite=Strict");
  assert.ok(setCookie1.includes("Path=/"), "Cookie must have Path=/");
  // User profile fields must still be present for the frontend to populate state.
  assert.equal(res.body.email, "john.login@example.com", "Should return email");
  assert.equal(res.body.firstName, "John", "Should return firstName");
  assert.equal(res.body.lastName, "Doe", "Should return lastName");
  assert.ok(res.body.id, "Should return user id");
  assert.ok(Array.isArray(res.body.roles), "Should return roles array");
  assert.ok(Array.isArray(res.body.permissions), "Should return permissions array");
  assert.equal(res.body.message, "Login successful", "Should return success message");
  console.log("✓ Test 1: Successful login — token in HttpOnly cookie, not in body");
}

// Test 2: Successful login with username
{
  const userData = {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.login@example.com",
    password: "SecurePass456@",
    confirmPassword: "SecurePass456@",
  };
  await createTestUser(userData);

  const req = createRequest("POST", {
    usernameOrEmail: "jane.login@example.com",
    password: "SecurePass456@",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 200, "Should return 200 on successful login with email as username");
  assert.equal(res.body.token, undefined, "Token must not appear in body for username login either");
  const setCookie2 = res.headers["Set-Cookie"] || "";
  assert.ok(setCookie2.includes("HttpOnly"), "Cookie must be HttpOnly on username login");
  console.log("✓ Test 2: Successful login with username/email — HttpOnly cookie set");
}

// Test 3: Missing usernameOrEmail returns 400
{
  const req = createRequest("POST", {
    password: "SecurePass123!",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for missing usernameOrEmail");
  assert.ok(res.body.error, "Should return error message");
  assert.ok(res.body.error.includes("Username or email is required"), "Error should mention username or email required");
  console.log("✓ Test 3: Missing usernameOrEmail returns 400");
}

// Test 4: Missing password returns 400
{
  const req = createRequest("POST", {
    usernameOrEmail: "test@example.com",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for missing password");
  assert.ok(res.body.error, "Should return error message");
  assert.ok(res.body.error.includes("Password is required"), "Error should mention password required");
  console.log("✓ Test 4: Missing password returns 400");
}

// Test 5: Both fields missing returns 400
{
  const req = createRequest("POST", {});
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 when both fields are missing");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 5: Both fields missing returns 400");
}

// Test 6: Non-existent user returns 401
{
  const req = createRequest("POST", {
    usernameOrEmail: "nonexistent@example.com",
    password: "AnyPass@123",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 401, "Should return 401 for non-existent user");
  assert.equal(res.body.error, "Invalid credentials", "Should return generic 'Invalid credentials' message");
  console.log("✓ Test 6: Non-existent user returns 401");
}

// Test 7: Wrong password returns 401
{
  const req = createRequest("POST", {
    usernameOrEmail: "john.login@example.com",
    password: "WrongPassword@123",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 401, "Should return 401 for wrong password");
  assert.equal(res.body.error, "Invalid credentials", "Should return generic 'Invalid credentials' message");
  console.log("✓ Test 7: Wrong password returns 401");
}

// Test 8: GET method returns 405
{
  const req = createRequest("GET", null);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 405, "Should return 405 for non-POST method");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 8: GET method returns 405");
}

// Test 9: OPTIONS method returns 200 (CORS preflight)
{
  const req = createRequest("OPTIONS", null);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 200, "Should return 200 for OPTIONS preflight");
  console.log("✓ Test 9: OPTIONS method returns 200 (CORS preflight)");
}

// Test 10: Case insensitive email login
{
  const req = createRequest("POST", {
    usernameOrEmail: "JOHN.LOGIN@EXAMPLE.COM",
    password: "SecurePass123!",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 200, "Should return 200 for uppercase email");
  assert.equal(res.body.email, "john.login@example.com", "Email should be normalized to lowercase");
  console.log("✓ Test 10: Case insensitive email login");
}

// Test 11: JWT token delivered via HttpOnly cookie contains required claims
{
  const req = createRequest("POST", {
    usernameOrEmail: "john.login@example.com",
    password: "SecurePass123!",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 200, "Should return 200");
  // Token is in the Set-Cookie header, not the response body.
  assert.equal(res.body.token, undefined, "Token must not be in response body");
  const cookieHeader = res.headers["Set-Cookie"] || "";
  assert.ok(cookieHeader.length > 0, "Set-Cookie header must be present");

  // Extract the raw JWT from "token=<jwt>; HttpOnly; ..."
  const tokenMatch = cookieHeader.match(/token=([^;]+)/);
  assert.ok(tokenMatch, "Should be able to extract token from Set-Cookie header");
  const rawToken = tokenMatch[1];

  // Decode JWT payload (without signature verification — header contents only)
  const tokenParts = rawToken.split(".");
  assert.equal(tokenParts.length, 3, "JWT must have three parts (header.payload.signature)");
  const payload = JSON.parse(Buffer.from(tokenParts[1], "base64url").toString());

  assert.ok(payload.id, "JWT should contain user id");
  assert.ok(payload.email, "JWT should contain email");
  assert.ok(Array.isArray(payload.roles), "JWT should contain roles array");
  assert.equal(payload.permissions, undefined, "JWT should NOT contain permissions (server-side resolved)");
  assert.ok(payload.exp, "JWT should contain expiration claim");
  assert.ok(payload.iat, "JWT should contain issued-at claim");
  console.log("✓ Test 11: JWT in HttpOnly cookie contains required claims, not in response body");
}

// Test 12: Response body never contains a raw JWT string
{
  const req = createRequest("POST", {
    usernameOrEmail: "john.login@example.com",
    password: "SecurePass123!",
  });
  const res = createResponse();
  await handler(req, res);

  const bodyStr = JSON.stringify(res.body);
  // A JWT always matches three base64url segments separated by dots
  const jwtPattern = /eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*/;
  assert.ok(
    !jwtPattern.test(bodyStr),
    "Response body must not contain a raw JWT string"
  );
  console.log("✓ Test 12: Response body contains no raw JWT string");
}

// Test 12: Response includes role and permissions
{
  const req = createRequest("POST", {
    usernameOrEmail: "john.login@example.com",
    password: "SecurePass123!",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 200, "Should return 200");
  assert.ok(res.body.role, "Should return role");
  assert.ok(Array.isArray(res.body.roles), "Should return roles array");
  assert.ok(Array.isArray(res.body.permissions), "Should return permissions array");
  assert.ok(res.body.permissions.length > 0, "Permissions array should not be empty");
  console.log("✓ Test 12: Response includes role and permissions");
}

// Test 13: CORS headers are set for an allowed origin
{
  const req = createRequest("POST", {
    usernameOrEmail: "john.login@example.com",
    password: "SecurePass123!",
  }, { origin: AUTH_TEST_ALLOWED_ORIGIN }); // cors.js requires an origin header to reflect it
  const res = createResponse();
  await handler(req, res);

  assert.ok(res.headers["Access-Control-Allow-Origin"], "Should have CORS Allow-Origin header for allowed origin");
  assert.equal(res.headers["Access-Control-Allow-Origin"], AUTH_TEST_ALLOWED_ORIGIN, "Should reflect the request origin");
  assert.ok(res.headers["Access-Control-Allow-Credentials"], "Should have CORS Allow-Credentials header");
  console.log("✓ Test 13: CORS headers are set");
}

// Test 14: Empty string usernameOrEmail returns 400
{
  const req = createRequest("POST", {
    usernameOrEmail: "",
    password: "SecurePass123!",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for empty usernameOrEmail");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 14: Empty string usernameOrEmail returns 400");
}

// Test 15: Empty string password returns 400
{
  const req = createRequest("POST", {
    usernameOrEmail: "john.login@example.com",
    password: "",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for empty password");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 15: Empty string password returns 400");
}

// Test 16: Whitespace-only usernameOrEmail returns 400
{
  const req = createRequest("POST", {
    usernameOrEmail: "   ",
    password: "SecurePass123!",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for whitespace-only usernameOrEmail");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 16: Whitespace-only usernameOrEmail returns 400");
}

// Test 17: Login rate limit allows normal requests before limit
{
  const userData = {
    firstName: "RateLimit",
    lastName: "Tester",
    email: "ratelimit.login@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };
  await createTestUser(userData);

  for (let i = 1; i <= 5; i += 1) {
    const req = createRequest(
      "POST",
      { usernameOrEmail: "ratelimit.login@example.com", password: "SecurePass123!" },
      { "x-forwarded-for": "127.0.0.1" }
    );
    const res = createResponse();
    await handler(req, res);

    assert.notEqual(res.statusCode, 429, `Request ${i} should not be rate limited`);
  }
  console.log("✓ Test 17: Login rate limit allows normal requests before limit");
}

// Test 18: Login rate limit blocks after max attempts
{
  const req = createRequest(
    "POST",
    { usernameOrEmail: "ratelimit.login@example.com", password: "WrongPass123!" },
    { "x-forwarded-for": "127.0.0.1" }
  );
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 429, "Should return 429 after login attempts exceed the limit");
  assert.equal(res.body.success, false, "Should return success false when blocked");
  assert.equal(res.body.message, "Too many authentication attempts. Please try again later.");
  console.log("✓ Test 18: Login rate limit blocks after max attempts");
}

console.log("\n✅ All login endpoint tests passed!");
