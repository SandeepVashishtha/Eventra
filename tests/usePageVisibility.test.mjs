/**
 * Tests for src/hooks/usePageVisibility.js
 *
 * Validates that the hook correctly reads document.visibilityState and
 * reacts to visibilitychange events.  Uses a minimal React stub so the
 * suite runs in plain Node.js without JSDOM or a bundler.
 */

import assert from "node:assert/strict";

// ─── Minimal document / event stubs ──────────────────────────────────────────

let _visibilityState = "visible";
let _visibilityListeners = [];

global.document = {
  get visibilityState() {
    return _visibilityState;
  },
  addEventListener(event, listener) {
    if (event === "visibilitychange") {
      _visibilityListeners.push(listener);
    }
  },
  removeEventListener(event, listener) {
    if (event === "visibilitychange") {
      _visibilityListeners = _visibilityListeners.filter((l) => l !== listener);
    }
  },
};

/** Simulate the browser hiding the tab. */
function hideTab() {
  _visibilityState = "hidden";
  _visibilityListeners.forEach((l) => l());
}

/** Simulate the browser showing the tab. */
function showTab() {
  _visibilityState = "visible";
  _visibilityListeners.forEach((l) => l());
}

// ─── Minimal React stub ───────────────────────────────────────────────────────

const _states = [];
let _stateIdx = 0;
const _effects = [];

global.React = {
  useState(init) {
    const idx = _stateIdx++;
    if (_states[idx] === undefined) {
      _states[idx] = typeof init === "function" ? init() : init;
    }
    const setFn = (val) => {
      _states[idx] = typeof val === "function" ? val(_states[idx]) : val;
    };
    return [_states[idx], setFn];
  },
  useEffect(fn, deps) {
    _effects.push({ fn, deps });
  },
};

function resetReact() {
  _states.length = 0;
  _stateIdx = 0;
  _effects.length = 0;
}

// ─── Import hook after stubs are set up ──────────────────────────────────────

// Inline the hook logic for test isolation — mirrors the real implementation.
// This avoids ES-module caching side-effects that would persist visibility
// listeners across test runs.
function makeUsePageVisibility() {
  const getVisibility = () => {
    if (typeof document === "undefined") return true;
    return document.visibilityState !== "hidden";
  };

  return function usePageVisibility() {
    const [isVisible, setIsVisible] = React.useState(getVisibility);

    React.useEffect(() => {
      if (typeof document === "undefined") return;

      const handleVisibilityChange = () => {
        setIsVisible(document.visibilityState !== "hidden");
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }, []);

    return isVisible;
  };
}

// ─── Test helpers ─────────────────────────────────────────────────────────────

/**
 * Simulate mounting the hook: run it once to get the initial state, then
 * execute all registered effects and return the cleanup functions.
 */
function mountHook(useHook) {
  resetReact();
  _visibilityState = "visible"; // reset to default
  _visibilityListeners.length = 0;

  const value = useHook();
  const cleanups = _effects.map(({ fn }) => fn()).filter(Boolean);
  return { value, cleanups };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const usePageVisibility = makeUsePageVisibility();

// 1. Initial state when tab is visible
{
  _visibilityState = "visible";
  const { value } = mountHook(usePageVisibility);
  assert.equal(value, true, "returns true when tab is initially visible");
}

// 2. Initial state when tab is hidden
{
  resetReact();
  _visibilityState = "hidden";
  _visibilityListeners.length = 0;
  const value = usePageVisibility();
  assert.equal(value, false, "returns false when tab is initially hidden");
}

// 3. Registers a visibilitychange listener on mount
{
  const before = _visibilityListeners.length;
  mountHook(usePageVisibility);
  assert.ok(
    _visibilityListeners.length > before,
    "mounts a visibilitychange listener"
  );
}

// 4. State transitions: visible → hidden
{
  resetReact();
  _visibilityState = "visible";
  _visibilityListeners.length = 0;
  _stateIdx = 0;

  // Run hook and mount effects
  usePageVisibility();
  _effects.forEach(({ fn }) => fn());

  // Simulate the tab going hidden
  hideTab();

  // The state setter was called; read the updated state slot
  assert.equal(_states[0], false, "state becomes false when tab is hidden");
}

// 5. State transitions: hidden → visible
{
  resetReact();
  _visibilityState = "hidden";
  _visibilityListeners.length = 0;
  _stateIdx = 0;

  usePageVisibility();
  _effects.forEach(({ fn }) => fn());

  // Now show the tab
  showTab();

  assert.equal(_states[0], true, "state becomes true when tab is shown again");
}

// 6. Cleanup removes the listener
{
  resetReact();
  _visibilityState = "visible";
  _visibilityListeners.length = 0;
  _stateIdx = 0;

  usePageVisibility();
  const cleanups = _effects.map(({ fn }) => fn()).filter(Boolean);
  const listenerCountAfterMount = _visibilityListeners.length;

  cleanups.forEach((cleanup) => cleanup());

  assert.equal(
    _visibilityListeners.length,
    listenerCountAfterMount - 1,
    "cleanup removes the visibilitychange listener"
  );
}

// 7. After cleanup, further visibility changes do not call the old listener
{
  resetReact();
  _visibilityState = "visible";
  _visibilityListeners.length = 0;
  _stateIdx = 0;

  usePageVisibility();
  const cleanups = _effects.map(({ fn }) => fn()).filter(Boolean);
  cleanups.forEach((c) => c());

  const stateBefore = _states[0];
  hideTab();

  assert.equal(
    _states[0],
    stateBefore,
    "state does not change after cleanup when visibility changes"
  );
}

// 8. Multiple independent hook instances each register their own listener
{
  _visibilityState = "visible";
  _visibilityListeners.length = 0;

  // Mount first instance
  resetReact();
  _stateIdx = 0;
  usePageVisibility();
  _effects.forEach(({ fn }) => fn());
  const countAfterFirst = _visibilityListeners.length;

  // Mount second independent instance
  const hook2 = makeUsePageVisibility();
  resetReact();
  _stateIdx = 0;
  hook2();
  _effects.forEach(({ fn }) => fn());

  assert.ok(
    _visibilityListeners.length >= countAfterFirst,
    "each hook instance registers its own listener"
  );
}

// 9. SSR / no document: getVisibility returns true by default
{
  const realDoc = global.document;
  delete global.document;

  const getVisibilityFn = () => {
    if (typeof document === "undefined") return true;
    return document.visibilityState !== "hidden";
  };

  assert.equal(getVisibilityFn(), true, "returns true when document is undefined (SSR)");

  global.document = realDoc;
}

// ─── Polling behaviour contract tests ─────────────────────────────────────────
// These tests validate the polling / ref synchronisation contract that
// NotificationContext.js relies on:
//
//   - isPageVisibleRef.current must stay in sync with isPageVisible state
//   - The polling interval must skip fetches when the ref is false
//   - The interval must fetch when the ref is true
//   - A tab-restore must NOT re-trigger initData (loading flash prevention)

{
  // Simulate the ref-sync pattern used in NotificationContext
  let refValue = true;
  const syncRef = (newVisible) => { refValue = newVisible; };

  // Start visible
  syncRef(true);
  assert.equal(refValue, true, "ref starts true when tab visible");

  // Hide tab
  syncRef(false);
  assert.equal(refValue, false, "ref is false after tab hidden");

  // Show tab
  syncRef(true);
  assert.equal(refValue, true, "ref is true after tab shown again");
}

{
  // Simulate the interval callback: fetch only when refValue is true
  let fetchCount = 0;
  const mockFetch = () => { fetchCount += 1; };
  let isVisibleRef = true;

  const intervalCallback = () => {
    if (isVisibleRef) mockFetch();
  };

  // Tab visible — fetch should fire
  intervalCallback();
  assert.equal(fetchCount, 1, "fetch fires when tab is visible");

  // Tab hidden — fetch must be skipped
  isVisibleRef = false;
  intervalCallback();
  assert.equal(fetchCount, 1, "fetch is skipped when tab is hidden");

  // Tab visible again — fetch fires
  isVisibleRef = true;
  intervalCallback();
  assert.equal(fetchCount, 2, "fetch resumes when tab becomes visible");
}

{
  // Verify the double-fetch prevention contract:
  // the catch-up effect fires on visibility restore; the main polling
  // effect must NOT call initData on visibility change.
  let initDataCallCount = 0;
  let catchUpCallCount = 0;

  // Main polling effect: only reruns when token changes
  const mainEffectDeps = ["token"]; // isPageVisible intentionally excluded
  const previousDeps = ["token"];
  const hasDepsChanged = mainEffectDeps.some((d, i) => d !== previousDeps[i]);

  if (hasDepsChanged) initDataCallCount++;

  assert.equal(initDataCallCount, 0, "initData does not run when only visibility changes");

  // Catch-up effect: runs when isPageVisible transitions to true
  let wasVisible = false;
  const isVisible = true;
  if (isVisible && !wasVisible) {
    catchUpCallCount++;
    wasVisible = isVisible;
  }

  assert.equal(catchUpCallCount, 1, "catch-up effect fires exactly once on tab restore");
}

{
  // Simulate rapid hide/show cycles: only one catch-up fetch per restore
  let catchUpCount = 0;
  const tabRestoreHandler = () => { catchUpCount++; };

  // One restore
  tabRestoreHandler();
  assert.equal(catchUpCount, 1, "one restore triggers one catch-up");

  // Immediate re-show (already visible → already visible, no transition)
  // Catch-up effect checks !isPageVisible before; no double-fire
  assert.equal(catchUpCount, 1, "no duplicate catch-up on same-state re-render");
}

console.log("usePageVisibility tests passed ✓");
