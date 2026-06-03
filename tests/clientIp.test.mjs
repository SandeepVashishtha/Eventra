import assert from "node:assert/strict";
import { getClientIp } from "../api/lib/getClientIp.js";

{
  const ip = getClientIp({
    headers: { "x-real-ip": " 203.0.113.7 " },
  });
  assert.equal(ip, "203.0.113.7");
}

{
  const ip = getClientIp({
    headers: {},
    socket: { remoteAddress: "198.51.100.10" },
  });
  assert.equal(ip, "198.51.100.10");
}

// Test /0 global subnet matching (Issue 3 fix verification)
{
  process.env.TRUSTED_PROXY_SUBNETS = "0.0.0.0/0";
  const ip = getClientIp({
    headers: { "x-forwarded-for": "1.2.3.4" },
    socket: { remoteAddress: "198.51.100.10" },
  });
  // Since 198.51.100.10 matches 0.0.0.0/0, the connection is trusted, and we extract client IP from X-Forwarded-For.
  assert.equal(ip, "1.2.3.4");
  delete process.env.TRUSTED_PROXY_SUBNETS;
}

console.log("clientIp tests passed.");
