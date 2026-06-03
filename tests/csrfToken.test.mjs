import assert from "node:assert/strict";
import { getCSRFTokenFromMeta, getCSRFTokenFromCookie, getCSRFToken, csrfFetch } from "../src/utils/csrfToken.js";

globalThis.document = {
  querySelector: (sel) => {
    if (sel.includes("csrf-token")) {
      return { getAttribute: (attr) => attr === "content" ? "meta-token-123" : null };
    }
    return null;
  }
};

globalThis.cookieStore = {};
Object.defineProperty(globalThis.document, "cookie", {
  get: () => "XSRF-TOKEN=cookie-token-456; other-cookie=abc",
  configurable: true
});

globalThis.fetch = async (url, options) => {
  return { ok: true, url, options };
};

try {
  assert.equal(getCSRFTokenFromMeta(), "meta-token-123");
  assert.equal(getCSRFTokenFromCookie(), "cookie-token-456");
  assert.equal(getCSRFToken(), "meta-token-123");

  const res = await csrfFetch("/api/test", { method: "POST" });
  assert.equal(res.options.headers["X-CSRF-Token"], "meta-token-123");

  console.log("csrfToken tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
