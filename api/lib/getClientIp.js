const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
// Validates full (8-group) or compressed (::) IPv6 addresses.
// Does not match link-local zone IDs (e.g. fe80::1%eth0).
const IPV6_REGEX = /^(?:(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,7}:|(?:[0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,5}(?::[0-9a-f]{1,4}){1,2}|(?:[0-9a-f]{1,4}:){1,4}(?::[0-9a-f]{1,4}){1,3}|(?:[0-9a-f]{1,4}:){1,3}(?::[0-9a-f]{1,4}){1,4}|(?:[0-9a-f]{1,4}:){1,2}(?::[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:(?::[0-9a-f]{1,4}){1,6}|:(?::[0-9a-f]{1,4}){1,7}|::)$/i;
const IPV4_MAPPED_IPV6_REGEX = /^::ffff:(\d{1,3}\.){3}\d{1,3}$/i;
const IPV4_COMPAT_IPV6_REGEX = /^::(\d{1,3}\.){3}\d{1,3}$/i;

// Trusted proxy IP subnets. When the direct TCP connection comes from one of
// these addresses, the X-Forwarded-For header is trusted and the rightmost
// (most recent) non-proxy IP is returned. In all other cases the header is
// ignored to prevent client-side IP spoofing.
const TRUSTED_PROXY_SUBNETS = [
  // Vercel, AWS, GCP, Cloudflare, common reverse proxies
  // Production deployments should harden this list via env var.
  { ip: "::1", prefix: 128 },                       // IPv6 localhost
  { ip: "127.0.0.1", prefix: 8 },                   // IPv4 localhost
  { ip: "10.0.0.0", prefix: 8 },                    // RFC 1918 (Vercel internal)
  { ip: "172.16.0.0", prefix: 12 },                 // RFC 1918
  { ip: "192.168.0.0", prefix: 16 },                // RFC 1918
];

const DEFAULT_PREFIX_V4 = 32;
const DEFAULT_PREFIX_V6 = 128;

const parseTrustedProxies = () => {
  const env = process.env.TRUSTED_PROXY_SUBNETS;
  if (!env) return TRUSTED_PROXY_SUBNETS;
  return env.split(",").map((entry) => {
    const [ip, prefix] = entry.trim().split("/");
    const isV6 = IPV6_REGEX.test(ip) || IPV4_MAPPED_IPV6_REGEX.test(ip) || IPV4_COMPAT_IPV6_REGEX.test(ip);
    return { ip, prefix: prefix ? Number(prefix) : (isV6 ? DEFAULT_PREFIX_V6 : DEFAULT_PREFIX_V4) };
  }).filter((e) => e.ip && isValidIp(e.ip));
};

const ipToInt = (ip) => {
  const octets = ip.split(".");
  return ((parseInt(octets[0], 10) << 24)
        | (parseInt(octets[1], 10) << 16)
        | (parseInt(octets[2], 10) << 8)
        | parseInt(octets[3], 10)) >>> 0;
};

const ipv6ToBytes = (ip) => {
  // Handle IPv4-mapped/compat IPv6 (e.g. ::ffff:192.168.1.1, ::192.168.1.1)
  const ipv4Mapped = IPV4_MAPPED_IPV6_REGEX.exec(ip) || IPV4_COMPAT_IPV6_REGEX.exec(ip);
  if (ipv4Mapped) {
    const ipv4Part = ip.split(":").pop();
    const octets = ipv4Part.split(".").map(Number);
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, octets[0], octets[1], octets[2], octets[3]];
  }

  const parts = ip.split(":");
  const groups = parts.filter((p) => p !== "");
  const emptyIndex = parts.indexOf("");

  let expandedGroups;
  if (emptyIndex !== -1) {
    const zeroCount = 8 - groups.length;
    const before = groups.slice(0, emptyIndex);
    const after = groups.slice(emptyIndex);
    expandedGroups = [...before, ...Array(zeroCount).fill("0"), ...after];
  } else {
    expandedGroups = groups;
  }

  return expandedGroups.flatMap((group) => {
    const hex = group.padStart(4, "0");
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16)];
  });
};

const isInSubnet = (ip, subnet) => {
  if (IPV4_REGEX.test(ip) && IPV4_REGEX.test(subnet.ip)) {
    const ipInt = ipToInt(ip);
    const subnetInt = ipToInt(subnet.ip);
    const mask = ~0 << (32 - subnet.prefix);
    return (ipInt & mask) === (subnetInt & mask);
  }
  const isIpV6 = IPV6_REGEX.test(ip) || IPV4_MAPPED_IPV6_REGEX.test(ip) || IPV4_COMPAT_IPV6_REGEX.test(ip);
  const isSubV6 = IPV6_REGEX.test(subnet.ip) || IPV4_MAPPED_IPV6_REGEX.test(subnet.ip) || IPV4_COMPAT_IPV6_REGEX.test(subnet.ip);
  if (isIpV6 && isSubV6) {
    const ipBytes = ipv6ToBytes(ip);
    const subBytes = ipv6ToBytes(subnet.ip);
    const fullBytes = Math.ceil(Math.min(subnet.prefix, 128) / 8);
    for (let i = 0; i < fullBytes && i < ipBytes.length && i < subBytes.length; i++) {
      if (ipBytes[i] !== subBytes[i]) return false;
    }
    return true;
  }
  return false;
};

const isTrustedConnection = (ip) => {
  if (!ip || !isValidIp(ip)) return false;
  const trustedSubnets = parseTrustedProxies();
  return trustedSubnets.some((subnet) => isInSubnet(ip, subnet));
};

const isValidIp = (ip) => {
  if (!ip || typeof ip !== "string") return false;
  const trimmed = ip.trim();
  if (IPV4_REGEX.test(trimmed)) {
    return trimmed.split(".").every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }
  if (IPV6_REGEX.test(trimmed)) return true;
  if (IPV4_MAPPED_IPV6_REGEX.test(trimmed)) {
    const ipv4Part = trimmed.split(":").pop();
    return ipv4Part.split(".").every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }
  return IPV4_COMPAT_IPV6_REGEX.test(trimmed);
};

const readHeader = (headers, name) => {
  if (!headers) return null;
  const lower = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) return headers[key];
  }
  return null;
};

const getLastNonTrustedIp = (forwardedFor) => {
  const ips = String(forwardedFor).split(",").map((s) => s.trim()).filter(Boolean);
  // Walk the chain from right to left; the first non-trusted IP is the client.
  for (let i = ips.length - 1; i >= 0; i--) {
    if (!isTrustedConnection(ips[i])) return ips[i];
  }
  // All IPs are trusted proxies — return the leftmost anyway.
  return ips[ips.length - 1] || null;
};

export function getClientIp(req) {
  const headers = req?.headers;
  const directIp = req?.socket?.remoteAddress || req?.connection?.remoteAddress || "127.0.0.1";

  // Vercel sets X-Vercel-Forwarded-For internally — trust it when present.
  // In Vercel deployments the direct connection always comes from a Vercel proxy,
  // so we trust the platform header unconditionally.
  const vercelIp = readHeader(headers, "x-vercel-forwarded-for");
  if (vercelIp) {
    const ip = getLastNonTrustedIp(vercelIp);
    if (ip && isValidIp(ip)) return ip;
  }

  // Only trust X-Forwarded-For when the direct connection is from a known proxy.
  const forwarded = readHeader(headers, "x-forwarded-for");
  if (forwarded && directIp && isTrustedConnection(directIp)) {
    const ip = getLastNonTrustedIp(forwarded);
    if (ip && isValidIp(ip)) return ip;
  }

  // X-Real-Ip is set by some proxies (Nginx, Cloudflare) — trust it only when
  // the direct connection originates from a known proxy.
  const realIp = readHeader(headers, "x-real-ip");
  if (realIp && directIp && isTrustedConnection(directIp)) {
    const ip = String(realIp).trim();
    if (isValidIp(ip)) return ip;
  }

  // Fallback to the direct TCP connection address.
  return directIp || "unknown";
}
