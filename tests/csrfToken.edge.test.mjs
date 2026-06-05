import assert from "node:assert/strict";
import { getCSRFToken } from "../src/utils/csrfToken.js";

globalThis.document = {
  querySelector() { return null; },
  cookie: ""
};

assert.equal(getCSRFToken(), null);
console.log("csrfToken edge tests passed ✓");
