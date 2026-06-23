import {
  isDistributedRateLimitStorageConfigured,
  isInMemoryRateLimitStorageAllowed,
} from "../api/_lib/rate-limit-config.js";

const API_RATE_LIMIT = 60;
const API_RATE_WINDOW_S = 60;

export const inMemoryRateLimitStore = new Map();

const TRUSTED_PROXY_CIDR_DEFAULT = [
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.0.0/16",
  "127.0.0.0/8",
];

function parseCIDR(cidr) {
  const [ip, bits] = cidr.split("/");
  const maskBits = bits ? parseInt(bits, 10) : 32;
  const octets = ip.split(".").map(Number);
  const ipNum =
    ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>>
    0;
  const mask = ~0 << (32 - maskBits);
  return { network: ipNum & mask, mask };
}

function ipInCIDR(ip, cidrList) {
  const octets = ip.split(".").map(Number);
  if (octets.length !== 4 || octets.some(isNaN)) return false;
  const ipNum =
    ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>>
    0;
  for (const cidr of cidrList) {
    const { network, mask } = parseCIDR(cidr);
    if ((ipNum & mask) === network) return true;
  }
  return false;
}

const IPV4_RE =
  /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_RE =
  /^([0-9a-fA-F]{0,4}:){2,7}([0-9a-fA-F]{0,4})$/;

function isValidIP(value) {
  if (typeof value !== "string" || !value) return false;

  const v4Match = value.match(IPV4_RE);
  if (v4Match) {
    return v4Match.slice(1).every((octet) => {
      const n = parseInt(octet, 10);
      return n >= 0 && n <= 255;
    });
  }

  return IPV6_RE.test(value);
}

function resolveClientIP(request) {
  const platformIP =
    request.headers.get("x-vercel-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("true-client-ip");

  if (platformIP && isValidIP(platformIP)) {
    return platformIP;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded && typeof forwarded === "string") {
    const proxies = forwarded.split(",").map((s) => s.trim()).filter(Boolean);

    if (proxies.length === 1 && isValidIP(proxies[0])) {
      return proxies[0];
    }

    if (proxies.length > 1) {
      const trustedCidrEnv = process.env.TRUSTED_PROXY_CIDR;
      const trustedCIDRs = trustedCidrEnv
        ? trustedCidrEnv.split(",").map((s) => s.trim()).filter(Boolean)
        : TRUSTED_PROXY_CIDR_DEFAULT;

      for (let i = proxies.length - 1; i >= 0; i--) {
        if (!isValidIP(proxies[i])) continue;
        if (!ipInCIDR(proxies[i], trustedCIDRs)) {
          return proxies[i];
        }
      }
      return proxies[0];
    }
  }

  if (realIP && isValidIP(realIP)) {
    return realIP;
  }

  return "unknown";
}

const isRateLimited = async (ip) => {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  const isProduction = process.env.NODE_ENV === "production";

  const isDistributedConfigured = isDistributedRateLimitStorageConfigured();
  const isInMemoryAllowed = isInMemoryRateLimitStorageAllowed();

  if (isProduction && !isDistributedConfigured) {
    console.error(
      "[SECURITY] Rate limiting unavailable: KV_REST_API_URL and KV_REST_API_TOKEN are required in production. Rejecting request."
    );
    return true;
  }

  if (!isDistributedConfigured) {
    if (isInMemoryAllowed) {
      console.warn(
        "[DEV] Rate limiting using in-memory fallback (distributed storage not configured)"
      );
      return checkInMemoryRateLimit(ip);
    } else {
      console.error(
        "[SECURITY] Rate limiting unavailable: Distributed storage not configured and in-memory fallback not permitted. Rejecting request."
      );
      return true;
    }
  }

  try {
    const key = `rl:${ip}`;
    const headers = {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json",
    };

    const incrRes = await fetch(`${kvUrl}/incr/${key}`, {
      method: "POST",
      headers,
    });

    if (!incrRes.ok) {
      if (isProduction) {
        console.error(
          `[SECURITY] Rate limiting unavailable: KV request failed with status ${incrRes.status}. Rejecting request.`
        );
        return true;
      }
      console.warn(
        `[DEV] KV request failed with status ${incrRes.status}. Falling back to in-memory rate limiting.`
      );
      return checkInMemoryRateLimit(ip);
    }

    const { result: count } = await incrRes.json();

    if (count === 1) {
      await fetch(`${kvUrl}/expire/${key}/${API_RATE_WINDOW_S}`, {
        method: "POST",
        headers,
      });
    }

    return count > API_RATE_LIMIT;
  } catch (error) {
    if (isProduction) {
      console.error(
        "[SECURITY] Rate limiting unavailable: KV communication error.",
        error.message
      );
      return true;
    }
    console.warn(
      "[DEV] KV communication error. Falling back to in-memory rate limiting.",
      error.message
    );
    return checkInMemoryRateLimit(ip);
  }
};

const checkInMemoryRateLimit = (ip) => {
  if (!isValidIP(ip) && ip !== "unknown") return true;

  const key = `rl:${ip}`;
  const now = Date.now();
  const entry = inMemoryRateLimitStore.get(key);

  if (!entry || now - entry.timestamp > API_RATE_WINDOW_S * 1000) {
    inMemoryRateLimitStore.set(key, { count: 1, timestamp: now });
    return false;
  }

  entry.count++;
  inMemoryRateLimitStore.set(key, entry);

  return entry.count > API_RATE_LIMIT;
};

export async function checkRateLimit(request) {
  const ip = resolveClientIP(request);

  if (await isRateLimited(ip)) {
    return { limited: true, ip, window: API_RATE_WINDOW_S };
  }
  return { limited: false, ip };
}
