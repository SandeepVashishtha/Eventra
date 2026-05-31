function readHeader(headers, name) {
  if (!headers) return "";

  if (typeof headers.get === "function") {
    return headers.get(name) || "";
  }

  const value = headers[name] || headers[name.toLowerCase()] || headers[name.toUpperCase()];
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export function getClientIp(req) {
  const realIp = readHeader(req?.headers, "x-real-ip");
  if (realIp) {
    return String(realIp).trim();
  }

  return (
    req?.socket?.remoteAddress ||
    req?.connection?.remoteAddress ||
    "unknown"
  );
}
