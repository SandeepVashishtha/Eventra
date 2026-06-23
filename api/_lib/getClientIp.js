/**
 * Secure Client IP Extraction with Trusted Proxy Validation
 *
 * This function extracts the client IP address from a request while preventing
 * IP spoofing attacks by validating trusted proxy chains before accepting forwarding headers.
 *
 * Security Principles:
 * - Only trust forwarding headers from configured trusted proxies
 * - Validate all IP addresses using Node's built-in net.isIP()
 * - Parse X-Forwarded-For chain correctly (right-to-left validation)
 * - Reject malformed or invalid IP addresses
 * - Fall back to connection IP when headers are untrusted
 * - Log suspicious forwarding patterns
 *
 * Environment Configuration:
 * TRUSTED_PROXIES - Comma-separated list of trusted proxy IP addresses
 *                   Example: 127.0.0.1,::1,10.0.0.0/8
 *                   Default: 127.0.0.1,::1 (localhost only)
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

/**
 * Parse TRUSTED_PROXIES environment variable into a set of IP addresses
 * @returns {Set<string>} Set of trusted proxy IP addresses
 */
const parseTrustedProxies = () => {
  const envValue = process.env.TRUSTED_PROXIES || "127.0.0.1,::1";
  const proxies = new Set();

  for (const proxy of envValue.split(",")) {
    const trimmed = proxy.trim();
    if (trimmed && net.isIP(trimmed)) {
      proxies.add(trimmed);
    } else if (trimmed) {
      console.warn(
        `[RATE_LIMIT] Invalid trusted proxy configuration: "${trimmed}" is not a valid IP address`
      );
    }
  }

  return proxies;
};

/**
 * Check if an IP address is in the trusted proxy list
 * @param {string} ip - IP address to check
 * @param {Set<string>} trustedProxies - Set of trusted proxy IPs
 * @returns {boolean} True if IP is trusted
 */
const isTrustedProxy = (ip, trustedProxies) => {
  return trustedProxies.has(ip);
};

/**
 * Validate and parse X-Forwarded-For header
 * Format: client, proxy1, proxy2 (leftmost is original client)
 * @param {string} header - X-Forwarded-For header value
 * @param {Set<string>} trustedProxies - Set of trusted proxy IPs
 * @param {string} connectionIp - Direct connection IP
 * @returns {string|null} Valid client IP or null if validation fails
 */
const parseXForwardedFor = (header, trustedProxies, connectionIp) => {
  if (!header || typeof header !== "string") {
    return null;
  }

  const ips = header.split(",").map((ip) => ip.trim());

  // Validate all IPs in the chain
  for (const ip of ips) {
    if (!net.isIP(ip)) {
      console.warn(
        `[RATE_LIMIT] Invalid IP in X-Forwarded-For chain: "${ip}"`
      );
      return null;
    }
  }

  // If connection IP is not a trusted proxy, ignore the header entirely
  if (!isTrustedProxy(connectionIp, trustedProxies)) {
    console.warn(
      `[RATE_LIMIT] Untrusted forwarding header detected - connection from ${connectionIp} is not in trusted proxy list`
    );
    return null;
  }

  // Validate the chain from right to left (proxies to client)
  // The rightmost IP should be the immediate proxy (connection IP)
  // Exception: single IP chain (just client) is valid if connection is trusted
  const rightmost = ips[ips.length - 1];
  if (ips.length === 1) {
    // Single IP: just the client, accept if connection is from trusted proxy
    // No further validation needed
  } else if (rightmost !== connectionIp && !isTrustedProxy(rightmost, trustedProxies)) {
    console.warn(
      `[RATE_LIMIT] Invalid X-Forwarded-For chain - rightmost IP ${rightmost} does not match connection ${connectionIp} and is not trusted`
    );
    return null;
  }

  // All intermediate IPs (excluding leftmost client IP and rightmost if already checked) should be trusted proxies
  // For chain: client, proxy1, proxy2
  // Check: proxy2 (rightmost), proxy1 (middle)
  // Skip: client (leftmost)
  for (let i = ips.length - 2; i >= 1; i--) {
    const proxyIp = ips[i];
    if (!isTrustedProxy(proxyIp, trustedProxies)) {
      console.warn(
        `[RATE_LIMIT] Untrusted proxy in chain: ${proxyIp} at position ${i}`
      );
      return null;
    }
  }

  // Leftmost IP is the original client
  return ips[0];
};

/**
 * Extract client IP from request with trusted proxy validation
 * Handles both Web API Request objects (headers.get()) and Node.js-style objects (headers[key])
 * @param {Object} req - HTTP request object (Web API Request or Node.js request)
 * @returns {string} Validated client IP or "unknown"
 */
export const getClientIp = (req) => {
  if (!req || typeof req !== "object") {
    return "unknown";
  }

  const trustedProxies = parseTrustedProxies();

  // Get direct connection IP (fallback if headers are untrusted)
  const connectionIp = req.socket?.remoteAddress || "unknown";

  // Helper to get header value (supports both Web API Headers and plain objects)
  const getHeader = (name) => {
    const headers = req.headers;
    if (!headers) return null;

    // Web API Headers object (has .get method)
    if (typeof headers.get === "function") {
      return headers.get(name);
    }

    // Plain object (Node.js style)
    return headers[name];
  };

  // Try X-Forwarded-For with trusted proxy validation
  const xForwardedFor = getHeader("x-forwarded-for");
  if (xForwardedFor) {
    const clientIp = parseXForwardedFor(xForwardedFor, trustedProxies, connectionIp);
    if (clientIp) {
      return clientIp;
    }
  }

  // Try X-Real-IP only if connection is from trusted proxy
  const xRealIP = getHeader("x-real-ip");
  if (xRealIP) {
    if (!isTrustedProxy(connectionIp, trustedProxies)) {
      console.warn(
        `[RATE_LIMIT] Untrusted X-Real-IP header detected - connection from ${connectionIp} is not in trusted proxy list`
      );
    } else if (net.isIP(xRealIP)) {
      return xRealIP;
    } else {
      console.warn(
        `[RATE_LIMIT] Invalid X-Real-IP value: "${xRealIP}"`
      );
    }
  }

  // Fall back to connection IP
  if (connectionIp !== "unknown" && net.isIP(connectionIp)) {
    return connectionIp;
  }

  return "unknown";
};
