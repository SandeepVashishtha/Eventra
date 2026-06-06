export function getClientIp(req) {
  if (!req) return "unknown";

  const realIp = req.headers?.["x-real-ip"];
  if (realIp && typeof realIp === "string") {
    const trimmed = realIp.trim();
    if (trimmed) return trimmed;
  }

  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress;
  }

  return "unknown";
}
