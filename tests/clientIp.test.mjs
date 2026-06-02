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

console.log("clientIp tests passed.");
