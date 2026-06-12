export const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
  || req.headers["x-real-ip"]
  || req.socket?.remoteAddress
  || "unknown";

export const ipv6ToBytes = (ip) => {
  const parts = ip.split(":");
  const doubleColonIndex = parts.indexOf("");

  if (doubleColonIndex !== -1) {
    const nonEmptyParts = parts.filter(p => p !== "");
    const missingPartsCount = 8 - nonEmptyParts.length;
    const expandedParts = [];
    for (let i = 0; i < parts.length; i++) {
      if (i === doubleColonIndex && parts[i] === "") {
        for (let j = 0; j < missingPartsCount; j++) expandedParts.push("0000");
        if (parts[i + 1] === "") i++;
      } else if (parts[i] !== "") {
        expandedParts.push(parts[i]);
      }
    }
    return expandedParts.flatMap(part => {
      const hex = part.padStart(4, "0");
      return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16)];
    });
  }

  const bytes = [];
  for (const part of parts) {
    const hex = part.padStart(4, "0");
    bytes.push(parseInt(hex.slice(0, 2), 16));
    bytes.push(parseInt(hex.slice(2, 4), 16));
  }
  return bytes;
};

export const isInSubnet = (ip, subnet, prefix) => {
  const ipBytes = ipv6ToBytes(ip);
  if (ipBytes.length !== 16) return false;

  const subnetBytes = ipv6ToBytes(subnet);
  if (subnetBytes.length !== 16) return false;

  const fullBits = prefix;
  for (let i = 0; i < 16; i++) {
    const remaining = fullBits - (i * 8);
    if (remaining <= 0) break;
    const mask = remaining >= 8 ? 0xff : (0xff << (8 - remaining)) & 0xff;
    if ((ipBytes[i] & mask) !== (subnetBytes[i] & mask)) return false;
  }
  return true;
};
