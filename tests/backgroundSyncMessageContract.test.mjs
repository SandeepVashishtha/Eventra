/**
 * Background-sync message contract test.
 *
 * The service worker wakes the page to replay the offline queue by posting a
 * message to window clients; the page-side hook (useOfflineSync) listens for
 * that message and triggers a sync. If the two sides of the contract drift
 * (SW posts EVENTRA_BACKGROUND_SYNC while the hook only listens for
 * SYNC_REQUESTED), OS-initiated background sync silently no-ops.
 *
 * This test statically asserts the message type posted by the service worker
 * is accepted by the hook, so a rename on either side fails the suite.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const swCode = fs.readFileSync(
  path.resolve(__dirname, "../public/service-worker.js"),
  "utf8",
);
const hookCode = fs.readFileSync(
  path.resolve(__dirname, "../src/hooks/useOfflineSync.js"),
  "utf8",
);
const offlineQueueCode = fs.readFileSync(
  path.resolve(__dirname, "../src/utils/offlineQueue.js"),
  "utf8",
);

// ── Message type posted by the service worker ────────────────────────────────
const swPostedMatches = swCode.match(/type:\s*['"]([A-Z_]+)['"]/g) || [];
const swPostedTypes = swPostedMatches.map((m) => m.match(/['"]([A-Z_]+)['"]/)[1]);

assert.ok(
  swPostedTypes.includes("EVENTRA_BACKGROUND_SYNC"),
  "Service worker must post EVENTRA_BACKGROUND_SYNC when background sync fires",
);

const swPostedSyncType = swPostedTypes.find(
  (t) => t.includes("BACKGROUND_SYNC") || t === "SYNC_REQUESTED",
);
assert.ok(
  swPostedSyncType,
  "Service worker must post a background-sync message type to window clients",
);

// ── Message types accepted by the page-side hook ─────────────────────────────
const setMatch = hookCode.match(
  /SYNC_MESSAGE_TYPES\s*=\s*new Set\(\[([^\]]+)\]\)/,
);
assert.ok(
  setMatch,
  "useOfflineSync must declare a SYNC_MESSAGE_TYPES set of accepted message types",
);

const acceptedTypes = (setMatch[1].match(/['"][A-Z_]+['"]/g) || []).map((s) =>
  s.replace(/['"]/g, ""),
);

// ── Contract: every type the SW posts must be accepted by the hook ───────────
assert.ok(
  acceptedTypes.includes(swPostedSyncType),
  `Message contract mismatch: service worker posts ${swPostedSyncType} but ` +
    `useOfflineSync only accepts [${acceptedTypes.join(", ")}]`,
);

assert.ok(
  /addEventListener\(\s*['"]message['"]/.test(hookCode),
  "useOfflineSync must register a message event listener",
);

// ── Background sync tag must be shared between SW and the offline queue ──────
const swTags = (swCode.match(/BACKGROUND_SYNC_TAG\s*=\s*['"][^'"]+['"]/g) || []).map(
  (m) => m.match(/['"]([^'"]+)['"]/)[1],
);
const queueTags = (offlineQueueCode.match(/BACKGROUND_SYNC_TAG\s*=\s*['"][^'"]+['"]/g) || []).map(
  (m) => m.match(/['"]([^'"]+)['"]/)[1],
);

assert.ok(swTags.length > 0, "Service worker must define a BACKGROUND_SYNC_TAG");
assert.ok(
  swTags.some((t) => queueTags.includes(t)),
  "Service worker and offline queue must register the same background sync tag",
);

console.log("background-sync message contract tests passed ✓");
