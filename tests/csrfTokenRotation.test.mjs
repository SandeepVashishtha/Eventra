import assert from "node:assert/strict";
import {
  rotateCSRFToken,
  getCSRFToken,
  getCSRFTokenFromMeta,
  getCSRFTokenFromCookie,
} from "../src/utils/csrfToken.js";

function setupDocument({ cookie = "", metaContent = null }) {
  globalThis.document = {
    cookie,
    querySelector() {
      if (metaContent === null) return null;
      return { getAttribute: (name) => (name === "content" ? metaContent : null) };
    },
  };
}

try {
  // ── rotateCSRFToken writes the cookie ─────────────────────────────────────
  setupDocument({ cookie: "" });
  rotateCSRFToken("new-secure-token-12345");
  assert.equal(
    document.cookie.includes("XSRF-TOKEN=new-secure-token-12345"),
    true,
    "Should write token to document.cookie",
  );

  // ── getCSRFToken prefers the cookie over the meta tag ─────────────────────
  setupDocument({ cookie: "XSRF-TOKEN=cookie-token-abc", metaContent: "meta-token-def" });
  assert.equal(
    getCSRFToken(),
    "cookie-token-abc",
    "getCSRFToken() must prefer the cookie (source of truth) over the meta tag",
  );

  // ── getCSRFToken falls back to a real meta token when no cookie exists ────
  setupDocument({ cookie: "", metaContent: "real-server-injected-token" });
  assert.equal(
    getCSRFToken(),
    "real-server-injected-token",
    "getCSRFToken() should fall back to a real server-injected meta token",
  );

  // ── Literal build placeholders are never treated as a token ───────────────
  setupDocument({ cookie: "", metaContent: "%CSRF_TOKEN%" });
  assert.equal(
    getCSRFTokenFromMeta(),
    null,
    "getCSRFTokenFromMeta() must return null for a literal %CSRF_TOKEN% placeholder",
  );
  assert.equal(
    getCSRFToken(),
    null,
    "getCSRFToken() must not use a literal placeholder as a token",
  );

  // ── When the cookie holds a real token, a placeholder meta cannot shadow it ─
  setupDocument({ cookie: "XSRF-TOKEN=cookie-token-abc", metaContent: "%CSRF_TOKEN%" });
  assert.equal(
    getCSRFToken(),
    "cookie-token-abc",
    "A placeholder meta tag must never shadow the real cookie token",
  );

  // ── Cookie reader parses the XSRF-TOKEN value ─────────────────────────────
  setupDocument({ cookie: "foo=1; XSRF-TOKEN=per-session-token; bar=2" });
  assert.equal(
    getCSRFTokenFromCookie(),
    "per-session-token",
    "getCSRFTokenFromCookie() parses the XSRF-TOKEN cookie value",
  );

  console.log("csrfToken rotation + preference tests passed ✓");
} finally {
  delete globalThis.document;
}
