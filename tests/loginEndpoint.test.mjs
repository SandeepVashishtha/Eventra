import "./helpers/authTestEnv.mjs";
process.env.ALLOWED_ORIGIN = "http://localhost:3000";
import assert from "node:assert/strict";
const { default: handler, users } = await import("../api/auth/login.js");

// Mock allowed origin to test specific CORS headers correctly
process.env.ALLOWED_ORIGIN = "http://localhost:3000";

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

const createRequest = (method, body) => ({
  method,
  body,
});

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
  assert.ok(res.body.token, "Should return a JWT token");
  assert.equal(res.body.tokenType, "Bearer", "Should return tokenType as Bearer");
  assert.equal(res.body.email, "john.login@example.com", "Should return email");
  assert.equal(res.body.firstName, "John", "Should return firstName");
  assert.equal(res.body.lastName, "Doe", "Should return lastName");
  assert.ok(res.body.id, "Should return user id");
  assert.ok(Array.isArray(res.body.roles), "Should return roles array");
  assert.ok(Array.isArray(res.body.permissions), "Should return permissions array");
  assert.equal(res.body.message, "Login successful", "Should return success message");
  console.log("✓ Test 1: Successful login with email");
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
  assert.ok(res.body.token, "Should return a JWT token");
  console.log("✓ Test 2: Successful login with username/email");
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

// Test 11: JWT token contains required claims
{
  const req = createRequest("POST", {
    usernameOrEmail: "john.login@example.com",
    password: "SecurePass123!",
  });
  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 200, "Should return 200");
  assert.ok(res.body.token, "Should return a JWT token");
  
  // Decode JWT payload (without verification for testing)
  const tokenParts = res.body.token.split(".");
  const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
  
  assert.ok(payload.id, "JWT should contain user id");
  assert.ok(payload.email, "JWT should contain email");
  assert.ok(payload.roles, "JWT should contain roles");
  assert.ok(payload.permissions, "JWT should contain permissions");
  assert.ok(payload.exp, "JWT should contain expiration");
  console.log("✓ Test 11: JWT token contains required claims");
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

// Test 13: CORS headers are set
{
  const req = createRequest("POST", {
    usernameOrEmail: "john.login@example.com",
    password: "SecurePass123!",
  });
  const res = createResponse();
  await handler(req, res);

  assert.ok(res.headers["Access-Control-Allow-Origin"], "Should have CORS Allow-Origin header");
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

console.log("\n✅ All login endpoint tests passed!");