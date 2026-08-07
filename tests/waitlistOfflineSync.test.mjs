/**
 * Source-contract regression tests for Issue #11538.
 *
 * The offline fallback in waitlistUtils.joinWaitlist must enqueue a
 * JOIN_WAITLIST item (through pushToQueue) with the same waitlist-shaped
 * payload the server expects, otherwise useOfflineSync replays a malformed
 * request that the server rejects (4xx) and the join is silently dropped.
 *
 * These are static source assertions because waitlistUtils transitively pulls
 * in the browser-only api config (axios interceptors with `utils/*` aliases)
 * which the Node test runner cannot import.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const waitlistUtilsPath = "src/utils/waitlistUtils.js";
const source = readFileSync(waitlistUtilsPath, "utf8");

assert.match(
  source,
  /import \{ pushToQueue \} from "\.\/offlineQueue\.js";/,
  `${waitlistUtilsPath} must import pushToQueue from offlineQueue`
);

const offlineEnqueueSection = source.slice(
  source.indexOf("// Issue #11538"),
  source.indexOf("return newEntry;", source.indexOf("// Issue #11538"))
);

assert.ok(
  offlineEnqueueSection.includes("await pushToQueue("),
  "The offline fallback must enqueue the waitlist join via pushToQueue"
);

assert.match(
  offlineEnqueueSection,
  /actionType: "JOIN_WAITLIST"/,
  "The offline fallback must enqueue a JOIN_WAITLIST action"
);

assert.match(
  offlineEnqueueSection,
  /endpoint: `\$\{API_ENDPOINTS\.EVENTS\.ALL\}\/\$\{id\}\/waitlist/,
  "The offline fallback must enqueue to the event waitlist endpoint"
);

assert.match(
  offlineEnqueueSection,
  /idempotencyKey: `waitlist-join-\$\{userId\}-\$\{id\}`/,
  "The offline fallback must enqueue with a stable per-user per-event idempotency key"
);

assert.match(
  offlineEnqueueSection,
  /userId,|name: newEntry\.userName,|email: newEntry\.userEmail,|phone: newEntry\.phone,|eventTitle: newEntry\.eventTitle,/,
  "The offline fallback must enqueue the waitlist contract fields"
);

for (const field of ["userId", "name: newEntry.userName", "email: newEntry.userEmail", "phone: newEntry.phone", "eventTitle: newEntry.eventTitle"]) {
  assert.ok(
    offlineEnqueueSection.includes(field),
    `The offline enqueued payload must include ${field}`
  );
}

console.log("waitlist offline sync source-contract tests passed");
