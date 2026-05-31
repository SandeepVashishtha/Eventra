const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_REGEX = /^[0-9a-f:]+$/i;

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

export function getClientIp(req) {
  const headers = req?.headers;

  const vercelIp = readHeader(headers, "x-vercel-forwarded-for");
  if (vercelIp) {
    const ip = String(vercelIp).split(",")[0].trim();
    if (isValidIp(ip)) return ip;
  }

  const forwarded = readHeader(headers, "x-forwarded-for");
  if (forwarded) {
    const ip = String(forwarded).split(",")[0].trim();
    if (isValidIp(ip)) return ip;
  }

  const realIp = readHeader(headers, "x-real-ip");
  if (realIp) {
    const ip = String(realIp).trim();
    if (isValidIp(ip)) return ip;
  }

  return req?.socket?.remoteAddress || req?.connection?.remoteAddress || "unknown";
}
