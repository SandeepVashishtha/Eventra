import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>", {
  url: "https://eventra.test",
});
global.document = dom.window.document;
global.window = dom.window;

document.head.innerHTML = '<meta name="csrf-token" content="meta-token-123">';
document.cookie = "XSRF-TOKEN=cookie-token-456";

let fetchHeaders = null;
global.fetch = async (_url, options = {}) => {
  fetchHeaders = options.headers || {};
  return { ok: true };
};

const {
  csrfFetch,
  getCSRFToken,
  getCSRFTokenFromCookie,
  getCSRFTokenFromMeta,
} = await import("../src/utils/csrfToken.js");

assert.equal(getCSRFTokenFromMeta(), "meta-token-123");
assert.equal(getCSRFTokenFromCookie(), "cookie-token-456");
assert.equal(getCSRFToken(), "meta-token-123");

await csrfFetch("/api/events", { method: "POST", headers: { Accept: "application/json" } });
assert.equal(fetchHeaders["X-CSRF-Token"], "meta-token-123");
assert.equal(fetchHeaders.Accept, "application/json");

fetchHeaders = null;
await csrfFetch("/api/events", { method: "GET" });
assert.equal(fetchHeaders?.["X-CSRF-Token"], undefined);

document.head.innerHTML = "";
assert.equal(getCSRFToken(), "cookie-token-456");

delete global.document;
delete global.window;
delete global.fetch;

console.log("csrfToken tests passed ✓");
