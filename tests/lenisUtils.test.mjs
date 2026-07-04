/**
 * Unit tests for src/utils/lenisUtils.js
 *
 * Stubs window.lenis and window.scrollTo / document.querySelector so all
 * branches of the utility can be exercised in plain Node.js.
 */

import assert from "node:assert/strict";

// ── Stubs ───────────────────────────────────────────────────────────────────
const calls = {
  lenis: { scrollTo: [], stop: 0, start: 0 },
  window: { scrollTo: [] },
  document: { querySelector: [] },
};

const mockLenis = {
  scroll: 350,
  scrollTo: (...args) => calls.lenis.scrollTo.push(args),
  stop: () => { calls.lenis.stop += 1; },
  start: () => { calls.lenis.start += 1; },
};

global.document = {
  querySelector: (selector) => {
    calls.document.querySelector.push(selector);
    return { tagName: "DIV", dataset: {}, textContent: "" };
  },
};

global.window = {
  lenis: mockLenis,
  scrollY: 200,
  scrollTo: (opts) => calls.window.scrollTo.push(opts),
};

// ── Import module ────────────────────────────────────────────────────────────
const { scrollToElement, scrollToTop, stopScroll, startScroll, getScrollPosition } =
  await import("../src/utils/lenisUtils.js");

// ── scrollToElement ──────────────────────────────────────────────────────────
calls.lenis.scrollTo.length = 0;
scrollToElement("#hero");
assert.equal(
  calls.document.querySelector.at(-1),
  "#hero",
  "scrollToElement queries the DOM with the given selector"
);
assert.equal(calls.lenis.scrollTo.length, 1, "scrollToElement calls lenis.scrollTo once");
// Default options
const [targetEl, scrollOpts] = calls.lenis.scrollTo[0];
assert.ok(targetEl, "scrollToElement passes the resolved element to lenis.scrollTo");
assert.equal(scrollOpts.offset, 0, "default offset is 0");
assert.equal(scrollOpts.duration, 1.2, "default duration is 1.2");
assert.equal(typeof scrollOpts.easing, "function", "easing is a function");
assert.ok(scrollOpts.easing(1) <= 1, "easing(1) is at most 1");
assert.ok(scrollOpts.easing(0) >= 0, "easing(0) is at least 0");

// Override options
calls.lenis.scrollTo.length = 0;
scrollToElement("#footer", { offset: -80, duration: 0.5 });
const [, overrideOpts] = calls.lenis.scrollTo[0];
assert.equal(overrideOpts.offset, -80, "caller can override offset");
assert.equal(overrideOpts.duration, 0.5, "caller can override duration");

// When window.lenis is absent, scrollToElement is a no-op
calls.lenis.scrollTo.length = 0;
const savedLenis = global.window.lenis;
global.window.lenis = null;
scrollToElement("#somewhere");
assert.equal(calls.lenis.scrollTo.length, 0, "scrollToElement does nothing when lenis is absent");
global.window.lenis = savedLenis;

// ── scrollToTop ──────────────────────────────────────────────────────────────
calls.lenis.scrollTo.length = 0;
scrollToTop();
assert.equal(calls.lenis.scrollTo.length, 1, "scrollToTop calls lenis.scrollTo");
const [topTarget, topOpts] = calls.lenis.scrollTo[0];
assert.equal(topTarget, 0, "scrollToTop targets position 0");
assert.equal(topOpts.duration, 1.2, "scrollToTop default duration is 1.2");

// Fallback when lenis is absent
calls.window.scrollTo.length = 0;
global.window.lenis = null;
scrollToTop();
assert.equal(calls.window.scrollTo.length, 1, "scrollToTop falls back to window.scrollTo when lenis absent");
assert.equal(calls.window.scrollTo[0].top, 0, "fallback scrolls to top (0)");
assert.equal(calls.window.scrollTo[0].behavior, "smooth", "fallback behavior is smooth");
global.window.lenis = savedLenis;

// Custom behavior option in fallback
calls.window.scrollTo.length = 0;
global.window.lenis = null;
scrollToTop({ behavior: "auto" });
assert.equal(calls.window.scrollTo[0].behavior, "auto", "custom behavior option is forwarded");
global.window.lenis = savedLenis;

// ── stopScroll ───────────────────────────────────────────────────────────────
calls.lenis.stop = 0;
stopScroll();
assert.equal(calls.lenis.stop, 1, "stopScroll calls lenis.stop");

global.window.lenis = null;
assert.doesNotThrow(() => stopScroll(), "stopScroll is a no-op when lenis is absent");
global.window.lenis = savedLenis;

// ── startScroll ──────────────────────────────────────────────────────────────
calls.lenis.start = 0;
startScroll();
assert.equal(calls.lenis.start, 1, "startScroll calls lenis.start");

global.window.lenis = null;
assert.doesNotThrow(() => startScroll(), "startScroll is a no-op when lenis is absent");
global.window.lenis = savedLenis;

// ── getScrollPosition ─────────────────────────────────────────────────────────
assert.equal(
  getScrollPosition(),
  350,
  "getScrollPosition returns lenis.scroll when lenis is present"
);

global.window.lenis = null;
assert.equal(
  getScrollPosition(),
  200,
  "getScrollPosition falls back to window.scrollY when lenis is absent"
);
global.window.lenis = savedLenis;

console.log("All lenisUtils tests passed ✓");
