import assert from "node:assert/strict";
import { dismissToastsByGroup } from "../src/utils/toast.js";

globalThis.window = {
  __EVENTRA_TOASTS__: {
    auth: ["toast-1", "toast-2"]
  }
};

try {
  dismissToastsByGroup("auth");
  assert.equal(window.__EVENTRA_TOASTS__.auth.length, 0, "Should empty the auth toasts group list");
  console.log("toast groups dismissal tests passed ✓");
} finally {
  delete globalThis.window;
}
