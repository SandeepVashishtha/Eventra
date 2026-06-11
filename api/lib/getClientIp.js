export const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
  || req.headers["x-real-ip"]
  || req.socket?.remoteAddress
  || "unknown";
