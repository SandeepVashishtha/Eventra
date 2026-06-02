import crypto from "node:crypto";

process.env.NODE_ENV = "test";

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
}

if (!process.env.ALLOWED_ORIGIN) {
  process.env.ALLOWED_ORIGIN = "http://localhost:3000";
}
