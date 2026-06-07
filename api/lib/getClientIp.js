const PRIVATE_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

function isPrivateIp(ip) {
  return PRIVATE_RANGES.some((re) => re.test(ip));
}

export function getClientIp(req) {
  if (!req) return "unknown";

  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded && typeof forwarded === "string") {
    const first = forwarded.split(",")[0]?.trim();
    if (first && !isPrivateIp(first)) return first;
  }

  const realIp = req.headers?.["x-real-ip"];
  if (realIp && typeof realIp === "string") {
    const trimmed = realIp.trim();
    if (trimmed && !isPrivateIp(trimmed)) return trimmed;
  }

  if (req.socket?.remoteAddress) {
    const addr = req.socket.remoteAddress;
    if (addr && !isPrivateIp(addr)) return addr;
  }

  return "unknown";
}
