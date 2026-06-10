import jwt from "jsonwebtoken";
import { getJwtSecret } from "./jwt-config.js";

function buildClearCookieHeader(isProd) {
  return `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${isProd ? "; Secure" : ""}`;
}

function setClearCookie(res, cookieValue) {
  try {
    if (typeof res.setHeader === "function") {
      res.setHeader("Set-Cookie", cookieValue);
    } else if (typeof res.set === "function") {
      res.set({ "Set-Cookie": cookieValue });
    } else if (res.headers && typeof res.headers === "object") {
      res.headers["Set-Cookie"] = cookieValue;
    }
  } catch {
    // Ignore write errors on test response objects
  }
}

export default function logout(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    let token = null;

    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }

    if (!token && req.headers?.cookie) {
      const cookies = req.headers.cookie.split(";").map((c) => c.trim());
      const tokenCookie = cookies.find((c) => c.startsWith("token="));
      if (tokenCookie) {
        token = tokenCookie.slice(6);
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No valid token provided" });
    }

    try {
      jwt.verify(token, getJwtSecret());
    } catch (verifyError) {
      if (verifyError.name !== "TokenExpiredError") {
        return res.status(401).json({ message: "No valid token provided" });
      }
    }

    const isProd = process.env.NODE_ENV === "production";
    setClearCookie(res, buildClearCookieHeader(isProd));

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    try {
      const isProd = process.env.NODE_ENV === "production";
      setClearCookie(res, buildClearCookieHeader(isProd));
    } catch {
      // Ignore
    }
    return res.status(500).json({ message: "An error occurred during logout" });
  }
}
