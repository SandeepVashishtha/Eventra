const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_REGEX = /^[0-9a-f:]+$/i;

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

const parseTrustedProxies = () => {
  const env = process.env.TRUSTED_PROXY_SUBNETS;
  if (!env) return TRUSTED_PROXY_SUBNETS;
  return env.split(",").map((entry) => {
    const [ip, prefix] = entry.trim().split("/");
    return { ip, prefix: prefix ? parseInt(prefix, 10) : 32 };
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
  const parts = ip.split(":");
  const bytes = [];
  for (const part of parts) {
    if (part === "") continue;
    const hex = part.padStart(4, "0");
    bytes.push(parseInt(hex.slice(0, 2), 16));
    bytes.push(parseInt(hex.slice(2, 4), 16));
  }
  return bytes;
};

const isInSubnet = (ip, subnet) => {
  if (IPV4_REGEX.test(ip) && IPV4_REGEX.test(subnet.ip)) {
    const ipInt = ipToInt(ip);
    const subnetInt = ipToInt(subnet.ip);
    const mask = subnet.prefix === 0 ? 0 : (~0 << (32 - subnet.prefix));
    return (ipInt & mask) === (subnetInt & mask);
  }
  if (IPV6_REGEX.test(ip) && IPV6_REGEX.test(subnet.ip)) {
    const ipBytes = ipv6ToBytes(ip);
    const subBytes = ipv6ToBytes(subnet.ip);
    const fullBytes = Math.ceil(subnet.prefix / 8);
    for (let i = 0; i < fullBytes; i++) {
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
  return IPV6_REGEX.test(trimmed) && trimmed.length >= 2;
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
  const directIp = req?.socket?.remoteAddress || req?.connection?.remoteAddress || null;

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
