import assert from "node:assert/strict";
import { createShareModalData } from "../src/utils/shareModalUtils.js";

const originalWindow = global.window;
const originalConsoleWarn = console.warn;
const capturedWarnings = [];

global.window = {
  location: {
    origin: "https://eventra.test",
  },
};

console.warn = (...args) => {
  capturedWarnings.push(args);
};

try {
  const missingIdResult = createShareModalData({
    title: "Test Event",
    description: "A partially loaded event",
  });

  assert.equal(missingIdResult, null, "missing event.id should not produce share data");
  assert.equal(capturedWarnings.length, 1, "missing event.id should log a warning");

  const validResult = createShareModalData({
    id: "event-123",
    title: "Test Event",
    description: "A valid event",
    image: "/event.png",
  });

  assert.equal(validResult.shareUrl, "https://eventra.test/events/event-123");
  assert.ok(!validResult.shareUrl.endsWith("/undefined"), "share URL should never end with undefined");
  assert.ok(
    validResult.links.twitter.includes(encodeURIComponent("https://eventra.test/events/event-123")),
    "platform links should include the valid event URL",
  );

  console.log("share modal data guard tests passed ✓");
} finally {
  console.warn = originalConsoleWarn;
  global.window = originalWindow;
}
