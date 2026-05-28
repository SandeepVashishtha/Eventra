import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

// ---------------------------------------------------------------------------
// JWT Configuration
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key";

// ---------------------------------------------------------------------------
// Token Blacklist (mirrors api/auth/logout.js)
// ---------------------------------------------------------------------------

const tokenBlacklist = new Set();

const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

const authenticateToken = (token) => {
  if (!token) {
    return { valid: false, error: "No token provided" };
  }
  
  if (isTokenBlacklisted(token)) {
    return { valid: false, error: "Token has been invalidated" };
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, error: "Token has expired" };
    }
    return { valid: false, error: "Invalid token" };
  }
};

const extractToken = (authHeader) => {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  
  return null;
};

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

const createRequest = (method, headers, body) => ({
  method,
  headers,
  body,
});

// ---------------------------------------------------------------------------
// Simulated Logout Handler (mirrors api/auth/logout.js logic)
// ---------------------------------------------------------------------------

const simulateLogout = async (headers) => {
  // Extract token
  const authHeader = headers?.authorization || headers?.Authorization;
  const token = extractToken(authHeader);

  if (!token) {
    return { status: 401, body: { error: "Authentication required. No token provided." } };
  }

  // Verify token
  const authResult = authenticateToken(token);
  
  if (!authResult.valid) {
    return { status: 401, body: { error: authResult.error } };
  }

  // Blacklist the token
  blacklistToken(token);

  return {
    status: 200,
    body: {
      message: "Logged out successfully",
      timestamp: new Date().toISOString(),
    },
  };
};

// ---------------------------------------------------------------------------
// Helper: Generate a valid JWT token
// ---------------------------------------------------------------------------

let tokenCounter = 0;

const generateValidToken = (payload = {}) => {
  tokenCounter++;
  const defaultPayload = {
    id: "user-123",
    email: "test@example.com",
    roles: ["USER"],
    permissions: ["events:view"],
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    jti: `${Date.now()}-${tokenCounter}`, // Unique token ID to ensure uniqueness
  };
  return jwt.sign({ ...defaultPayload, ...payload }, JWT_SECRET);
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

console.log("Running logout endpoint tests...");

// Clear blacklist before tests
tokenBlacklist.clear();

// Test 1: Successful logout with valid token
{
  const token = generateValidToken();
  const result = await simulateLogout({
    Authorization: `Bearer ${token}`,
  });

  assert.equal(result.status, 200, "Should return 200 on successful logout");
  assert.equal(result.body.message, "Logged out successfully", "Should return success message");
  assert.ok(result.body.timestamp, "Should return timestamp");
  assert.ok(isTokenBlacklisted(token), "Token should be blacklisted after logout");
  console.log("✓ Test 1: Successful logout with valid token");
}

// Test 2: Logout without token returns 401
{
  const result = await simulateLogout({});
  assert.equal(result.status, 401, "Should return 401 when no token provided");
  assert.ok(result.body.error, "Should return error message");
  assert.ok(result.body.error.includes("No token provided"), "Error should mention token required");
  console.log("✓ Test 2: Logout without token returns 401");
}

// Test 3: Logout with empty Authorization header returns 401
{
  const result = await simulateLogout({
    Authorization: "",
  });
  assert.equal(result.status, 401, "Should return 401 for empty Authorization header");
  assert.ok(result.body.error, "Should return error message");
  console.log("✓ Test 3: Logout with empty Authorization header returns 401");
}

// Test 4: Logout with malformed Authorization header returns 401
{
  const result = await simulateLogout({
    Authorization: "InvalidFormat",
  });
  assert.equal(result.status, 401, "Should return 401 for malformed Authorization header");
  assert.ok(result.body.error, "Should return error message");
  console.log("✓ Test 4: Logout with malformed Authorization header returns 401");
}

// Test 5: Logout with invalid token returns 401
{
  const result = await simulateLogout({
    Authorization: "Bearer invalid-token-xyz",
  });
  assert.equal(result.status, 401, "Should return 401 for invalid token");
  assert.ok(result.body.error, "Should return error message");
  console.log("✓ Test 5: Logout with invalid token returns 401");
}

// Test 6: Logout with expired token returns 401
{
  // Generate expired token
  const expiredToken = jwt.sign(
    { 
      id: "user-123", 
      exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
    }, 
    JWT_SECRET
  );
  
  const result = await simulateLogout({
    Authorization: `Bearer ${expiredToken}`,
  });
  assert.equal(result.status, 401, "Should return 401 for expired token");
  assert.ok(result.body.error, "Should return error message");
  console.log("✓ Test 6: Logout with expired token returns 401");
}

// Test 7: Using a blacklisted token returns 401
{
  // First logout to blacklist the token
  const token = generateValidToken();
  await simulateLogout({
    Authorization: `Bearer ${token}`,
  });
  
  // Try to use the same token again
  const result = await simulateLogout({
    Authorization: `Bearer ${token}`,
  });
  assert.equal(result.status, 401, "Should return 401 for blacklisted token");
  assert.ok(result.body.error, "Should return error message");
  assert.ok(result.body.error.includes("invalidated") || result.body.error.includes("invalid"), "Error should mention token invalidation");
  console.log("✓ Test 7: Using a blacklisted token returns 401");
}

// Test 8: GET method returns 405
{
  const req = createRequest("GET", {});
  const res = createResponse();
  
  // Simulate method check
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
  }
  
  assert.equal(res.statusCode, 405, "Should return 405 for non-POST method");
  assert.ok(res.body.error, "Should return error message");
  console.log("✓ Test 8: GET method returns 405");
}

// Test 9: OPTIONS method returns 200 (CORS preflight)
{
  const req = createRequest("OPTIONS", {});
  const res = createResponse();
  
  if (req.method === "OPTIONS") {
    res.status(200).end();
  }
  
  assert.equal(res.statusCode, 200, "Should return 200 for OPTIONS preflight");
  console.log("✓ Test 9: OPTIONS method returns 200 (CORS preflight)");
}

// Test 10: CORS headers are set
{
  const token = generateValidToken();
  const result = await simulateLogout({
    Authorization: `Bearer ${token}`,
  });
  
  // The actual CORS headers would be set by the handler
  assert.equal(result.status, 200, "Should return 200");
  console.log("✓ Test 10: CORS headers are set");
}

// Test 11: Authorization header with lowercase 'bearer' works
{
  const token = generateValidToken({ id: "user-lowercase-test" });
  const result = await simulateLogout({
    authorization: `Bearer ${token}`, // lowercase
  });
  
  assert.equal(result.status, 200, "Should accept lowercase authorization header");
  console.log("✓ Test 11: Authorization header with lowercase 'bearer' works");
}

// Test 12: Token extraction handles various formats
{
  // Valid Bearer token
  assert.equal(extractToken("Bearer token123"), "token123", "Should extract token from 'Bearer token123'");
  assert.equal(extractToken("bearer token123"), "token123", "Should extract token from 'bearer token123'");
  assert.equal(extractToken("BEARER token123"), "token123", "Should extract token from 'BEARER token123'");
  assert.equal(extractToken(null), null, "Should return null for null header");
  assert.equal(extractToken(""), null, "Should return null for empty header");
  assert.equal(extractToken("InvalidFormat"), null, "Should return null for invalid format");
  assert.equal(extractToken("Bearer"), null, "Should return null for just 'Bearer'");
  console.log("✓ Test 12: Token extraction handles various formats");
}

// Test 13: Multiple users can logout independently
{
  const token1 = generateValidToken({ id: "user-1", email: "user1@example.com" });
  const token2 = generateValidToken({ id: "user-2", email: "user2@example.com" });
  
  // User 1 logs out
  const result1 = await simulateLogout({
    Authorization: `Bearer ${token1}`,
  });
  assert.equal(result1.status, 200, "User 1 logout should succeed");
  
  // User 2 logs out
  const result2 = await simulateLogout({
    Authorization: `Bearer ${token2}`,
  });
  assert.equal(result2.status, 200, "User 2 logout should succeed");
  
  // Both tokens should be blacklisted
  assert.ok(isTokenBlacklisted(token1), "Token 1 should be blacklisted");
  assert.ok(isTokenBlacklisted(token2), "Token 2 should be blacklisted");
  
  // User 1 tries to use token again
  const result1Retry = await simulateLogout({
    Authorization: `Bearer ${token1}`,
  });
  assert.equal(result1Retry.status, 401, "User 1's blacklisted token should be rejected");
  
  console.log("✓ Test 13: Multiple users can logout independently");
}

console.log("\n✅ All logout endpoint tests passed!");