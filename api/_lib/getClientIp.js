/**
 * Secure Client IP Extraction with IP Validation
 *
 * This function extracts the client IP address from a request while preventing
 * IP spoofing attacks by validating all IP addresses before accepting them.
 *
 * Security Principles:
 * - Validate all IP addresses using Node's built-in net.isIP()
 * - Reject malformed or invalid IP addresses
 * - Fall back to socket.remoteAddress when headers are invalid
 *
 * @param {Object} req - The HTTP request object
 * @param {Object} [req.headers] - Request headers
 * @param {string} [req.headers["x-forwarded-for"]] - X-Forwarded-For header
 * @param {string} [req.headers["x-real-ip"]] - X-Real-IP header
 * @param {Object} [req.socket] - Request socket
 * @param {string} [req.socket.remoteAddress] - Socket remote address
 * @returns {string} The validated client IP address, or "unknown" if no valid IP exists
 */
import net from "node:net";

export const getClientIp = (req) => {
  if (!req || typeof req !== "object") {
    return "unknown";
  }

  const headers = req.headers || {};

  // Try X-Forwarded-For first (leftmost IP is the original client)
  const xForwardedFor = headers["x-forwarded-for"];
  if (xForwardedFor) {
    const forwarded = xForwardedFor.split(",")[0]?.trim();
    if (forwarded && net.isIP(forwarded)) {
      return forwarded;
    }
  }

  // Try X-Real-IP as fallback
  const xRealIP = headers["x-real-ip"];
  if (xRealIP && net.isIP(xRealIP)) {
    return xRealIP;
  }

  // Fall back to socket.remoteAddress
  const remoteAddress = req.socket?.remoteAddress;
  if (remoteAddress && net.isIP(remoteAddress)) {
    return remoteAddress;
  }

  return "unknown";
};
