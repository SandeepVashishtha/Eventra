import { AUTH_TEST_ALLOWED_ORIGIN } from "./helpers/authTestEnv.mjs";
import assert from "node:assert/strict";
const { default: handler } = await import("../api/auth/signup.js");

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
  const finalHeaders = { ...headers };
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
// Test: Successful signup
// ---------------------------------------------------------------------------

console.log("Running signup endpoint tests...");

// Test 1: Successful signup with valid data
{
  const validUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  const req = createRequest("POST", validUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 201, "Should return 201 on successful signup");
  // Token must be in the HttpOnly Set-Cookie header, not the response body.
  assert.equal(res.body.token, undefined, "Token must not be exposed in signup response body");
  const setCookieSignup = res.headers?.["Set-Cookie"] || "";
  assert.ok(setCookieSignup.includes("HttpOnly"), "Signup must set an HttpOnly cookie");
  assert.equal(res.body.firstName, "John", "Should return firstName");
  assert.equal(res.body.lastName, "Doe", "Should return lastName");
  assert.equal(res.body.email, "john.doe@example.com", "Should return email (normalized)");
  assert.ok(res.body.id, "Should return user id");
  assert.ok(Array.isArray(res.body.roles), "Should return roles array");
  assert.ok(Array.isArray(res.body.permissions), "Should return permissions array");
  assert.ok(res.body.message, "Should return success message");
  console.log("✓ Test 1: Successful signup with valid data");
}

// Test 2: Duplicate email returns 409
{
  const duplicateUserData = {
    firstName: "Jane",
    lastName: "Doe",
    email: "john.doe@example.com", // Same email as test 1
    password: "SecurePass456@",
    confirmPassword: "SecurePass456@",
  };

  const req = createRequest("POST", duplicateUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 409, "Should return 409 for duplicate email");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 2: Duplicate email returns 409");
}

// Test 3: Missing firstName returns 400
{
  const invalidUserData = {
    lastName: "Doe",
    email: "test@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for missing firstName");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 3: Missing firstName returns 400");
}

// Test 4: Short firstName returns 400
{
  const invalidUserData = {
    firstName: "J",
    lastName: "Doe",
    email: "test2@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for short firstName");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 4: Short firstName returns 400");
}

// Test 5: Missing lastName returns 400
{
  const invalidUserData = {
    firstName: "John",
    email: "test3@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for missing lastName");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 5: Missing lastName returns 400");
}

// Test 6: Invalid email format returns 400
{
  const invalidUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "invalid-email",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for invalid email");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 6: Invalid email format returns 400");
}

// Test 7: Missing email returns 400
{
  const invalidUserData = {
    firstName: "John",
    lastName: "Doe",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for missing email");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 7: Missing email returns 400");
}

// Test 8: Short password returns 400
{
  const invalidUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "test4@example.com",
    password: "short",
    confirmPassword: "short",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for short password");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 8: Short password returns 400");
}

// Test 9: Weak password (missing criteria) returns 400
{
  const invalidUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "test5@example.com",
    password: "weakpassword", // No uppercase, number, or special char
    confirmPassword: "weakpassword",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for weak password");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 9: Weak password returns 400");
}

// Test 10: Password mismatch returns 400
{
  const invalidUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "test6@example.com",
    password: "SecurePass123!",
    confirmPassword: "DifferentPass456@",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for password mismatch");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 10: Password mismatch returns 400");
}

// Test 11: Missing confirmPassword returns 400
{
  const invalidUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "test7@example.com",
    password: "SecurePass123!",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for missing confirmPassword");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 11: Missing confirmPassword returns 400");
}

// Test 12: GET method returns 405
{
  const req = createRequest("GET", null);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 405, "Should return 405 for non-POST method");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 12: GET method returns 405");
}

// Test 13: OPTIONS method returns 200 (CORS preflight)
{
  const req = createRequest("OPTIONS", null);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 200, "Should return 200 for OPTIONS preflight");
  console.log("✓ Test 13: OPTIONS method returns 200 (CORS preflight)");
}

// Test 14: Email is normalized to lowercase
{
  const validUserData = {
    firstName: "Jane",
    lastName: "Smith",
    email: "JANE.SMITH@Example.COM",
    password: "SecurePass789#",
    confirmPassword: "SecurePass789#",
  };

  const req = createRequest("POST", validUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 201, "Should return 201 on successful signup");
  assert.equal(res.body.email, "jane.smith@example.com", "Email should be normalized to lowercase");
  console.log("✓ Test 14: Email is normalized to lowercase");
}

// Test 15: Names are trimmed
{
  const validUserData = {
    firstName: "  Alice  ",
    lastName: "  Johnson  ",
    email: "alice.johnson@example.com",
    password: "SecurePass111!",
    confirmPassword: "SecurePass111!",
  };

  const req = createRequest("POST", validUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 201, "Should return 201 on successful signup");
  assert.equal(res.body.firstName, "Alice", "firstName should be trimmed");
  assert.equal(res.body.lastName, "Johnson", "lastName should be trimmed");
  console.log("✓ Test 15: Names are trimmed");
}

// Test 16: CORS headers are set
{
  const validUserData = {
    firstName: "Bob",
    lastName: "Wilson",
    email: "bob.wilson@example.com",
    password: "SecurePass222!",
    confirmPassword: "SecurePass222!",
  };

  const req = createRequest("POST", validUserData, { origin: AUTH_TEST_ALLOWED_ORIGIN });
  const res = createResponse();
  await handler(req, res);

  assert.ok(res.headers["Access-Control-Allow-Origin"], "Should have CORS Allow-Origin header for allowed origin");
  assert.equal(res.headers["Access-Control-Allow-Origin"], AUTH_TEST_ALLOWED_ORIGIN, "Should reflect request origin");
  assert.ok(res.headers["Access-Control-Allow-Credentials"], "Should have CORS Allow-Credentials header");
  console.log("✓ Test 16: CORS headers are set");
}

// Test 17: Default roles include USER
{
  const validUserData = {
    firstName: "Carol",
    lastName: "Davis",
    email: "carol.davis@example.com",
    password: "SecurePass333!",
    confirmPassword: "SecurePass333!",
  };

  const req = createRequest("POST", validUserData);
  const res = createResponse();
  await handler(req, res);

  assert.ok(res.body.roles.includes("USER"), "Should include USER role");
  console.log("✓ Test 17: Default roles include USER");
}

// Test 18: First name too long (>50 chars) returns 400
{
  const invalidUserData = {
    firstName: "A".repeat(51),
    lastName: "Doe",
    email: "test8@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for firstName > 50 chars");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 18: First name too long (>50 chars) returns 400");
}

// Test 19: Last name too long (>50 chars) returns 400
{
  const invalidUserData = {
    firstName: "John",
    lastName: "B".repeat(51),
    email: "test9@example.com",
    password: "SecurePass123!",
    confirmPassword: "SecurePass123!",
  };

  const req = createRequest("POST", invalidUserData);
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 400, "Should return 400 for lastName > 50 chars");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 19: Last name too long (>50 chars) returns 400");
}

// Test 20: Signup rate limit allows normal requests before limit
{
  const baseEmail = "ratelimit.signup";
  for (let i = 1; i <= 5; i += 1) {
    const validUserData = {
      firstName: "Normal",
      lastName: `User${i}`,
      email: `${baseEmail}${i}@example.com`,
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    };

    const req = createRequest("POST", validUserData, { "x-forwarded-for": "127.0.0.2" });
    const res = createResponse();
    await handler(req, res);

    assert.notEqual(res.statusCode, 429, `Signup request ${i} should not be rate limited`);
  }
  console.log("✓ Test 20: Signup rate limit allows normal requests before limit");
}

// Test 21: Signup rate limit blocks after max attempts
{
  const req = createRequest(
    "POST",
    {
      firstName: "Blocked",
      lastName: "User",
      email: "ratelimit.signup6@example.com",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    },
    { "x-forwarded-for": "127.0.0.2" }
  );
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 429, "Should return 429 after signup attempts exceed the limit");
  assert.ok(res.body.error, "Should return an error field when rate-limited");
  assert.ok(
    res.body.error.toLowerCase().includes("too many") || res.body.error.toLowerCase().includes("rate"),
    "Error message should indicate rate limiting"
  );
  console.log("✓ Test 21: Signup rate limit blocks after max attempts");
}

console.log("\n✅ All signup endpoint tests passed!");
