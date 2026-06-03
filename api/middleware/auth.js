import jwt from "jsonwebtoken";
import { getJwtSecret } from "../auth/jwt-config.js";
import { users, usersById } from "../auth/signup.js";
import { buildCorsHeaders } from "../auth/cors.js";

// ---------------------------------------------------------------------------
// JWT Middleware
// ---------------------------------------------------------------------------

export const verifyAuth = (handler) => {
  return async (req, res) => {
    const corsHeaders = buildCorsHeaders(req);

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
      return res.status(401).set(corsHeaders).json({ error: "Unauthorized: Missing authentication token" });
    }

    // 2. Verify token signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).set(corsHeaders).json({ error: "Unauthorized: Token expired", expired: true });
      }
      return res.status(401).set(corsHeaders).json({ error: "Unauthorized: Invalid token" });
    }

    // 3. Verify the user referenced by the JWT still exists in the user store and is active.
    const userEmail = decoded?.email;
    const userId = decoded?.id;
    let user = null;

    if (userId) {
      user = usersById.get(userId);
    }
    if (!user && userEmail) {
      user = users.get(userEmail.toLowerCase());
    }

    if (!user) {
      return res.status(401).set(corsHeaders).json({ error: "Unauthorized: User account does not exist" });
    }

    if (user.isActive === false) {
      return res.status(401).set(corsHeaders).json({ error: "Unauthorized: User account is deactivated or suspended" });
    }

    // Ensure roles and permissions are loaded from the stored user record rather than trusting token payload values.
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username || user.email,
      roles: user.roles || ["USER"],
      permissions: user.permissions || [],
      isActive: true
    };

    req.authToken = token;
    return handler(req, res);
  };
};

