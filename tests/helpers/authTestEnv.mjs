import crypto from "node:crypto";

export const AUTH_TEST_ALLOWED_ORIGIN = "https://auth-test.eventra.local";

process.env.NODE_ENV = "test";
process.env.ALLOWED_ORIGIN = AUTH_TEST_ALLOWED_ORIGIN;
process.env.ALLOWED_ORIGINS = AUTH_TEST_ALLOWED_ORIGIN;

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
}
