import assert from "node:assert/strict";
import { getDeviceFingerprint } from "../src/utils/deviceFingerprint.js";

globalThis.window = {
  screen: { width: 1920, height: 1080, colorDepth: 24 },
  navigator: { userAgent: "MockBrowser", language: "en-US", hardwareConcurrency: 4 },
  location: { origin: "http://localhost" }
};
globalThis.document = {
  createElement(tag) {
    return {
      getContext() {
        return {
          fillRect() {},
          fillText() {}
        };
      },
      toDataURL() { return "data:image/png;base64,..."; }
    };
  }
};

const fp = getDeviceFingerprint();
assert.ok(fp);
console.log("deviceFingerprint edge tests passed ✓");
