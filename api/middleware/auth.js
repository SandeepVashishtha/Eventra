import jwt from "jsonwebtoken";
import { getJwtSecret } from "../auth/jwt-config.js";
import { users, usersById } from "../auth/signup.js";
import { isTokenBlacklisted } from "../auth/logout.js";

// ---------------------------------------------------------------------------
// JWT Middleware
// ---------------------------------------------------------------------------

export const verifyAuth = (handler) => {
  return async (req, res) => {
    // 1. Extract token from Cookie or Authorization header
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(";").map((c) => c.trim());
      const tokenCookie = cookies.find((c) => c.startsWith("token="));
      if (tokenCookie) {
        token = tokenCookie.substring(6);
      }
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
    }

    // 2. Check if token is blacklisted (invalidated by logout)
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ error: "Unauthorized: Token has been invalidated" });
    }

    // 3. Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Unauthorized: Token expired", expired: true });
      }
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // 4. Verify the user referenced by the JWT still exists in the user store.
    //
    //    CONTEXT: user records are held in a module-scoped in-memory Map that
    //    resets on every serverless cold start. A JWT issued before a cold start
    //    is still cryptographically valid (signature + expiry check pass), but
    //    the user it references no longer exists in the current instance. Without
    //    this check, protected endpoints would accept the orphaned token and then
    //    fail later with confusing errors when they try to look up the user.
    //
    //    This check is intentionally lightweight: it only confirms the user
    //    record is present in the current process. It does NOT replace a
    //    persistent database — that architectural fix is tracked separately.
    //    If the users Map is empty (cold start) this returns 401 with a clear
    //    message so the client can prompt re-authentication.
    const userEmail = decoded?.email;
    const userId = decoded?.id;

    if (userEmail || userId) {
      const userExists = userEmail
        ? users.has(userEmail.toLowerCase())
        : usersById.has(userId);

      if (!userExists) {
        return res.status(401).json({
          error: "Unauthorized: Session invalidated. Please log in again.",
          sessionInvalidated: true,
        });
      }
    }

    req.user = decoded;
    return handler(req, res);
  };
};
