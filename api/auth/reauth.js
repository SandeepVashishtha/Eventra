/**
 * Re-authentication endpoint.
 * Validates the password and clears the requires_reauth flag on the current session.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "./_jwt-config.js";
import { buildCorsHeaders, corsResponse } from "./_cors.js";
import { isStorageHealthy, getUserById } from "./_user-storage.js";
import { setSessionStatus } from "../_lib/sessionRisk.js";

function parseTokenFromCookie(req) {
  const cookieHeader = req.headers.cookie || "";
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
  return tokenMatch ? tokenMatch[1] : null;
}

export default async function reauth(req, res) {
  if (req.method === "OPTIONS") {
    return corsResponse(req, res, 200);
  }
  if (req.method && req.method !== "POST") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  const token = parseTokenFromCookie(req);
  if (!token) {
    return corsResponse(req, res, 401, { error: "No active session found" });
  }

  const { password } = req.body || {};
  if (!password) {
    return corsResponse(req, res, 400, { error: "Password is required" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    if (!payload || !payload.id || !payload.sessionId) {
      return corsResponse(req, res, 401, { error: "Invalid token structure" });
    }

    const storageHealthy = await isStorageHealthy();
    if (!storageHealthy) {
      return corsResponse(req, res, 500, { error: "Storage not available" });
    }

    const user = await getUserById(payload.id);
    if (!user) {
      return corsResponse(req, res, 401, { error: "User not found" });
    }

    const isValid = await bcrypt.compare(password, user.password || "");
    if (!isValid) {
      return corsResponse(req, res, 401, { error: "Invalid password" });
    }

    // Password is valid. Clear the session risk.
    await setSessionStatus(payload.sessionId, "active");

    return corsResponse(req, res, 200, { message: "Re-authenticated successfully" });
  } catch (error) {
    return corsResponse(req, res, 401, { error: "Token verification failed" });
  }
}
