import jwt from "jsonwebtoken";
import { getJwtSecret } from "../auth/jwt-config.js";

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
      const cookies = req.headers.cookie.split(";").map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith("token="));
      if (tokenCookie) {
        token = tokenCookie.substring(6);
      }
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: Missing authentication token" });
    }

    // 2. Verify token
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = decoded; // Attach user payload to request
      return handler(req, res);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Unauthorized: Token expired", expired: true });
      }
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };
};
