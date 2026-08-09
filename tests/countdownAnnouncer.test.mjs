import assert from "node:assert/strict";
import { shouldAnnounceCountdown } from "../src/utils/countdownAnnouncer.js";

assert.ok(shouldAnnounceCountdown(60));
assert.ok(!shouldAnnounceCountdown(55));
console.log("countdownAnnouncer tests passed ✓");
