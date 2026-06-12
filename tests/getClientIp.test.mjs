import assert from "node:assert/strict";
import { ipv6ToBytes, isInSubnet } from "../api/lib/getClientIp.js";

assert.deepEqual(
  ipv6ToBytes("2001:db8::1"),
  [0x20, 0x01, 0x0d, 0xb8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  "Should expand :: correctly"
);

assert.deepEqual(
  ipv6ToBytes("::1"),
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  "Should expand loopback ::1 correctly"
);

assert.deepEqual(
  ipv6ToBytes("2001:db8:85a3::8a2e:370:7334"),
  [0x20, 0x01, 0x0d, 0xb8, 0x85, 0xa3, 0, 0, 0, 0, 0x8a, 0x2e, 0x03, 0x70, 0x73, 0x34],
  "Should expand :: in middle correctly"
);

const bytes = ipv6ToBytes("::1");
assert.equal(bytes.length, 16, "Should produce 16 bytes");

assert.equal(
  isInSubnet("2001:db8::1", "2001:db8::", 32),
  true,
  "2001:db8::1 should be in 2001:db8::/32"
);

assert.equal(
  isInSubnet("2001:db9::1", "2001:db8::", 32),
  false,
  "2001:db9::1 should NOT be in 2001:db8::/32"
);

assert.equal(
  isInSubnet("::1", "::", 0),
  true,
  "::1 should be in ::/0"
);

assert.equal(
  isInSubnet("::1", "::", 128),
  false,
  "::1 should NOT be in ::/128"
);

assert.equal(
  isInSubnet("::2", "::1", 128),
  false,
  "::2 should NOT be in ::1/128"
);

assert.equal(
  isInSubnet("fe80::1", "fe80::", 10),
  true,
  "fe80::1 should be in fe80::/10"
);

assert.equal(
  isInSubnet("invalid", "::", 64),
  false,
  "Invalid IPv6 should return false"
);
