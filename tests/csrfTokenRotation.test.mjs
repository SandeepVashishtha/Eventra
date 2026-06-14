import assert from "node:assert/strict";
import { rotateCSRFToken, getCSRFTokenFromCookie } from "../src/utils/csrfToken.js";

globalThis.document = {
  cookie: "",
  querySelector() { return null; }
};

try {
  rotateCSRFToken("new-secure-token-12345");
  assert.equal(document.cookie.includes("XSRF-TOKEN=new-secure-token-12345"), true, "Should write token to document.cookie");
  console.log("csrfToken rotation tests passed ✓");
} finally {
  delete globalThis.document;
}
