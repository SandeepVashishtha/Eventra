import "./helpers/authTestEnv.mjs";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import { users } from "../api/auth/signup.js";
const { default: handler } = await import("../api/send-email.js");

process.env.EMAILJS_SERVICE_ID = "service-id";
process.env.EMAILJS_TEMPLATE_ID = "template-id";
process.env.EMAILJS_PUBLIC_KEY = "public-key";

const createResponse = () => {
  const headers = {};
  return {
    statusCode: 200,
    body: null,
    headers,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
  };
};

const authEmail = "recipient@example.com";
const token = jwt.sign({ id: "user-1", email: authEmail }, process.env.JWT_SECRET, {
  expiresIn: "1h",
});

users.set(authEmail, {
  id: "user-1",
  email: authEmail,
  username: "recipient",
  roles: ["USER"],
  permissions: ["events:view"],
});

let fetchCalled = false;
globalThis.fetch = async () => {
  fetchCalled = true;
  return {
    ok: true,
    text: async () => "",
  };
};

{
  fetchCalled = false;
  const req = {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    cookies: {},
    user: null,
    body: {
      toEmail: authEmail,
      toName: "Recipient",
      eventName: "Builder Summit",
      eventDate: "2026-05-31",
    },
  };

  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.sent, true);
  assert.equal(fetchCalled, true);
}

{
  fetchCalled = false;
  const req = {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    cookies: {},
    user: null,
    body: {
      toEmail: "other@example.com",
      toName: "Recipient",
      eventName: "Builder Summit",
      eventDate: "2026-05-31",
    },
  };

  const res = createResponse();
  await handler(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.error.includes("authenticated email"), true);
  assert.equal(fetchCalled, false);
}

console.log("send-email recipient tests passed.");
