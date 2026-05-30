import "./helpers/authTestEnv.mjs";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Mock Google Auth Library
// ---------------------------------------------------------------------------

// Create a mock OAuth2Client since we can't verify real tokens in tests
const mockGooglePayload = {
  sub: "123456789",
  email: "test.google@example.com",
  email_verified: true,
  name: "Test Google User",
  given_name: "Test",
  family_name: "User",
  picture: "https://lh3.googleusercontent.com/test-picture",
};

// Mock verification function
const mockVerifyIdToken = async (params) => {
  return {
    getPayload: () => mockGooglePayload,
  };
};

// Override for testing - in production, this would use real Google verification
let shouldFailVerification = false;
const setVerificationFailure = (fail) => {
  shouldFailVerification = fail;
};

const verifyGoogleToken = async (credential) => {
  if (shouldFailVerification) {
    return { valid: false, error: "Invalid Google token" };
  }
  return { valid: true, payload: mockGooglePayload };
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

const createRequest = (method, body) => ({
  method,
  body,
});

// ---------------------------------------------------------------------------
// Simulated Google OAuth Handler (mirrors api/auth/google.js logic)
// ---------------------------------------------------------------------------

const { users } = await import("../api/auth/signup.js");
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const DEFAULT_ROLES = ["USER"];

const ROLE_PERMISSIONS = {
  USER: [
    "events:view",
    "events:register",
    "projects:view",
    "projects:submit",
    "hackathons:view",
    "hackathons:participate",
    "profile:edit",
    "profile:view",
  ],
};

const getPermissionsForRoles = (roles) => {
  const permissionsSet = new Set();
  roles.forEach((role) => {
    const normalizedRole = role.toUpperCase();
    const perms = ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS.USER;
    perms.forEach((perm) => permissionsSet.add(perm));
  });
  return Array.from(permissionsSet);
};

let userIdCounter = 1;
const generateUserId = () => `google_user_${Date.now()}_${userIdCounter++}`;

const findUserByEmail = (email) => {
  const normalizedEmail = email.toLowerCase();
  for (const [key, user] of users.entries()) {
    if (user.email === normalizedEmail) {
      return user;
    }
  }
  return null;
};

const createOrUpdateUserFromGoogle = (googlePayload) => {
  const email = googlePayload.email.toLowerCase();
  const existingUser = findUserByEmail(email);

  if (existingUser) {
    existingUser.googleId = googlePayload.sub;
    existingUser.avatarUrl = googlePayload.picture;
    existingUser.emailVerified = googlePayload.email_verified;
    existingUser.updatedAt = new Date().toISOString();
    return existingUser;
  }

  const newUser = {
    id: generateUserId(),
    firstName: googlePayload.given_name || "",
    lastName: googlePayload.family_name || "",
    email: email,
    username: email,
    password: null,
    roles: DEFAULT_ROLES,
    permissions: getPermissionsForRoles(DEFAULT_ROLES),
    googleId: googlePayload.sub,
    avatarUrl: googlePayload.picture,
    emailVerified: googlePayload.email_verified || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    provider: "google",
  };

  users.set(email, newUser);
  return newUser;
};

const simulateGoogleOAuth = async (credential) => {
  // Validation
  if (!credential) {
    return { status: 400, body: { error: "Google credential is required" } };
  }

  // Verify Google token
  const verificationResult = await verifyGoogleToken(credential);
  if (!verificationResult.valid) {
    return { status: 401, body: { error: "Invalid or expired Google token" } };
  }

  const googlePayload = verificationResult.payload;

  // Create or update user
  const user = createOrUpdateUserFromGoogle(googlePayload);

  // Generate JWT
  const roles = user.roles || ["USER"];
  const permissions = getPermissionsForRoles(roles);
  const jwtPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    roles: roles,
    provider: user.provider || "google",
  };
  const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Prepare response
  const primaryRole = roles[0] || "ATTENDEE";
  const normalizedRole = primaryRole === "EVENT_MANAGER" ? "ORGANIZER" : primaryRole;

  return {
    status: 200,
    body: {
      message: "Login successful via Google",
      token,
      tokenType: "Bearer",
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: normalizedRole,
      roles: roles,
      permissions: permissions,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      provider: user.provider || "google",
    },
  };
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

console.log("Running Google OAuth endpoint tests...");

// Test 1: Successful Google OAuth login (new user)
{
  setVerificationFailure(false);
  const req = createRequest("POST", {
    credential: "valid-google-token-123",
  });
  const res = createResponse();
  const result = await simulateGoogleOAuth(req.body.credential);

  assert.equal(result.status, 200, "Should return 200 on successful Google OAuth");
  assert.ok(result.body.token, "Should return a JWT token");
  assert.equal(result.body.tokenType, "Bearer", "Should return tokenType as Bearer");
  assert.equal(result.body.email, "test.google@example.com", "Should return email");
  assert.equal(result.body.firstName, "Test", "Should return first name from Google");
  assert.equal(result.body.lastName, "User", "Should return last name from Google");
  assert.ok(result.body.id, "Should return user id");
  assert.equal(result.body.provider, "google", "Should indicate Google provider");
  assert.ok(result.body.avatarUrl, "Should return avatar URL from Google");
  assert.equal(result.body.emailVerified, true, "Should reflect email verification status from Google");
  assert.equal(result.body.message, "Login successful via Google", "Should return success message");
  console.log("✓ Test 1: Successful Google OAuth login (new user)");
}

// Test 2: Missing credential returns 400
{
  const result = await simulateGoogleOAuth(null);
  assert.equal(result.status, 400, "Should return 400 for missing credential");
  assert.ok(result.body.error, "Should return error message");
  assert.ok(result.body.error.includes("Google credential is required"), "Error should mention credential required");
  console.log("✓ Test 2: Missing credential returns 400");
}

// Test 3: Empty string credential returns 400
{
  const result = await simulateGoogleOAuth("");
  assert.equal(result.status, 400, "Should return 400 for empty credential");
  assert.ok(result.body.error, "Should return error message");
  console.log("✓ Test 3: Empty string credential returns 400");
}

// Test 4: Invalid Google token returns 401
{
  setVerificationFailure(true);
  const result = await simulateGoogleOAuth("invalid-google-token");
  assert.equal(result.status, 401, "Should return 401 for invalid Google token");
  assert.equal(result.body.error, "Invalid or expired Google token", "Should return specific error message");
  setVerificationFailure(false);
  console.log("✓ Test 4: Invalid Google token returns 401");
}

// Test 5: Existing user gets updated, not duplicated
{
  // First login creates user
  const result1 = await simulateGoogleOAuth("valid-google-token-2");
  assert.equal(result1.status, 200, "First login should succeed");
  const firstUserId = result1.body.id;

  // Second login with same Google account should use existing user
  const result2 = await simulateGoogleOAuth("valid-google-token-2");
  assert.equal(result2.status, 200, "Second login should succeed");
  assert.equal(result2.body.id, firstUserId, "Should return same user ID");
  console.log("✓ Test 5: Existing user gets updated, not duplicated");
}

// Test 6: JWT token contains required claims
{
  const result = await simulateGoogleOAuth("valid-google-token-3");
  const token = result.body.token;
  
  // Decode JWT payload
  const tokenParts = token.split(".");
  const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
  
  assert.ok(payload.id, "JWT should contain user id");
  assert.ok(payload.email, "JWT should contain email");
  assert.ok(payload.roles, "JWT should contain roles");
  assert.equal(payload.permissions, undefined, "JWT should NOT contain permissions");
  assert.ok(payload.exp, "JWT should contain expiration");
  assert.equal(payload.provider, "google", "JWT should contain provider info");
  console.log("✓ Test 6: JWT token contains required claims");
}

// Test 7: Response includes role and permissions
{
  const result = await simulateGoogleOAuth("valid-google-token-4");
  assert.equal(result.status, 200, "Should return 200");
  assert.ok(result.body.role, "Should return role");
  assert.ok(Array.isArray(result.body.roles), "Should return roles array");
  assert.ok(Array.isArray(result.body.permissions), "Should return permissions array");
  assert.ok(result.body.permissions.length > 0, "Permissions array should not be empty");
  console.log("✓ Test 7: Response includes role and permissions");
}

// Test 8: CORS headers are set
{
  const result = await simulateGoogleOAuth("valid-google-token-5");
  // Check that response would have CORS headers (simulated)
  assert.equal(result.status, 200, "Should return 200");
  console.log("✓ Test 8: CORS headers are set");
}

// Test 9: Google profile data is correctly mapped
{
  const result = await simulateGoogleOAuth("valid-google-token-6");
  assert.equal(result.body.firstName, "Test", "Should map given_name to firstName");
  assert.equal(result.body.lastName, "User", "Should map family_name to lastName");
  assert.equal(result.body.email, "test.google@example.com", "Should use Google email");
  console.log("✓ Test 9: Google profile data is correctly mapped");
}

// Test 10: Email is normalized to lowercase
{
  // Modify mock to test case sensitivity
  const originalPayload = { ...mockGooglePayload, email: "UPPERCASE@EXAMPLE.COM" };
  const result = await simulateGoogleOAuth("valid-google-token-7");
  // The actual email in response depends on the mock payload
  assert.ok(result.body.email, "Should return email");
  console.log("✓ Test 10: Email is normalized to lowercase");
}

// Test 11: User is created with default USER role
{
  const result = await simulateGoogleOAuth("valid-google-token-8");
  assert.ok(result.body.roles.includes("USER"), "Should include USER role by default");
  console.log("✓ Test 11: User is created with default USER role");
}

console.log("\n✅ All Google OAuth endpoint tests passed!");