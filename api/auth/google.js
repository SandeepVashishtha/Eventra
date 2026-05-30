import { OAuth2Client } from "google-auth-library";
import { users } from "./signup.js";
import {
  corsHeaders,
  corsResponse,
  DEFAULT_ROLES,
  DEFAULT_PERMISSIONS,
  getPermissionsForRoles,
  buildAuthPayload,
  signToken,
  setAuthCookie,
  generateUserId,
} from "./_shared.js";

// ---------------------------------------------------------------------------
// Google OAuth Configuration
// ---------------------------------------------------------------------------

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error("[google.js] GOOGLE_CLIENT_ID environment variable is not set. Google OAuth will reject all tokens.");
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ---------------------------------------------------------------------------
// Find user by email
// ---------------------------------------------------------------------------

const findUserByEmail = (email) => {
  const normalizedEmail = email.toLowerCase();
  for (const [key, user] of users.entries()) {
    if (user.email === normalizedEmail) {
      return user;
    }
  }
  return null;
};

// ---------------------------------------------------------------------------
// Verify Google Token
// ---------------------------------------------------------------------------

const verifyGoogleToken = async (credential) => {
  if (!GOOGLE_CLIENT_ID) {
    return { valid: false, error: "Google OAuth is not configured on this server." };
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return { valid: true, payload };
  } catch (error) {
    console.error("Google token verification error:", error);
    return { valid: false, error: "Invalid Google token" };
  }
};

// ---------------------------------------------------------------------------
// Create or update user from Google profile
// ---------------------------------------------------------------------------

const createOrUpdateUserFromGoogle = (googlePayload) => {
  const email = googlePayload.email.toLowerCase();
  const existingUser = findUserByEmail(email);

  if (existingUser) {
    // Update existing user's Google info
    existingUser.googleId = googlePayload.sub;
    existingUser.avatarUrl = googlePayload.picture;
    existingUser.emailVerified = googlePayload.email_verified;
    existingUser.updatedAt = new Date().toISOString();
    return existingUser;
  }

  // Create new user
  const newUser = {
    id: generateUserId(),
    firstName: googlePayload.given_name || "",
    lastName: googlePayload.family_name || "",
    email: email,
    username: email,
    password: null, // No password for Google OAuth users
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

// ---------------------------------------------------------------------------
// Google OAuth Handler
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).set(corsHeaders(req)).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return corsResponse(res, 405, { error: "Method not allowed" }, req);
  }

  try {
    const { credential } = req.body;

    // -----------------------------------------------------------------------
    // Input Validation
    // -----------------------------------------------------------------------

    if (!credential) {
      return corsResponse(res, 400, { 
        error: "Google credential is required" 
      }, req);
    }

    // -----------------------------------------------------------------------
    // Verify Google Token
    // -----------------------------------------------------------------------

    const verificationResult = await verifyGoogleToken(credential);
    
    if (!verificationResult.valid) {
      return corsResponse(res, 401, { 
        error: "Invalid or expired Google token" 
      }, req);
    }

    const googlePayload = verificationResult.payload;

    // -----------------------------------------------------------------------
    // Create or update user
    // -----------------------------------------------------------------------

    const user = createOrUpdateUserFromGoogle(googlePayload);

    // -----------------------------------------------------------------------
    // Get permissions based on roles
    // -----------------------------------------------------------------------

    const roles = user.roles || ["USER"];
    const permissions = getPermissionsForRoles(roles);

    // -----------------------------------------------------------------------
    // Generate JWT token
    // -----------------------------------------------------------------------

    const jwtPayload = buildAuthPayload(user, { provider: user.provider || "google" });

    const token = signToken(jwtPayload);

    // -----------------------------------------------------------------------
    // Prepare response (exclude sensitive data)
    // -----------------------------------------------------------------------

    const primaryRole = roles[0] || "ATTENDEE";
    const normalizedRole = primaryRole === "EVENT_MANAGER" ? "ORGANIZER" : primaryRole;

    const userResponse = {
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
    };

    setAuthCookie(res, token);

    return corsResponse(res, 200, {
      message: "Login successful via Google",
      ...userResponse,
    }, req);

  } catch (error) {
    console.error("Google OAuth Error:", error);
    return corsResponse(res, 500, { 
      error: "Internal server error. Please try again later." 
    }, req);
  }
}
