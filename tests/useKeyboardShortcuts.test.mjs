import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

// ── Setup DOM Environment ───────────────────────────────────────────────────
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html>
    <body>
      <nav>
        <input type="text" id="nav-search" />
      </nav>
      <input type="text" id="body-text" />
      <select id="body-select">
        <option>Option 1</option>
      </select>
      <div id="content-edit" contenteditable="true" tabindex="0">Edit me</div>
    </body>
  </html>
`);

global.window = dom.window;
global.document = dom.window.document;
global.KeyboardEvent = dom.window.KeyboardEvent;
global.CustomEvent = dom.window.CustomEvent;

// Mock Navigate
const navigatedPaths = [];
globalThis.ReactRouterDomMock = {
  navigate: (path) => {
    navigatedPaths.push(path);
  }
};

// ── Setup React Mocking ──────────────────────────────────────────────────────
const activeCleanups = [];

global.React = {
  useState: (initial) => [initial, () => {}],
  useRef: (initial) => {
    return { current: initial };
  },
  useCallback: (fn) => fn,
  useEffect: (fn) => {
    const cleanup = fn();
    if (typeof cleanup === "function") {
      activeCleanups.push(cleanup);
    }
  }
};

// ── Import Hook ──────────────────────────────────────────────────────────────
const { useKeyboardShortcuts } = await import("../src/hooks/useKeyboardShortcuts.js");

// ── Listen to Custom Events ──────────────────────────────────────────────────
const commandPaletteEvents = [];
window.addEventListener("toggleCommandPalette", () => {
  commandPaletteEvents.push("toggle");
});
window.addEventListener("closeCommandPalette", () => {
  commandPaletteEvents.push("close");
});

// Helper to simulate keydown
function fireKeydown(keyOptions) {
  const event = new dom.window.KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ...keyOptions
  });
  dom.window.dispatchEvent(event);
  return event;
}

// Helper to reset test states
function setupTest(shortcuts = {}, disabled = false) {
  activeCleanups.forEach(c => {
    try { c(); } catch (e) {}
  });
  activeCleanups.length = 0;
  navigatedPaths.length = 0;
  commandPaletteEvents.length = 0;
  if (document.activeElement) {
    document.activeElement.blur();
  }
  useKeyboardShortcuts(shortcuts, disabled);
}

// ── Test Cases ───────────────────────────────────────────────────────────────

console.log("Running useKeyboardShortcuts tests...");

// 1. Alt Navigation Shortcuts
{
  setupTest();
  fireKeydown({ key: "d", altKey: true });
  assert.deepEqual(navigatedPaths, ["/dashboard"], "Alt+D should navigate to /dashboard");

  setupTest();
  fireKeydown({ key: "e", altKey: true });
  assert.deepEqual(navigatedPaths, ["/events"], "Alt+E should navigate to /events");

  setupTest();
  fireKeydown({ key: "p", altKey: true });
  assert.deepEqual(navigatedPaths, ["/profile"], "Alt+P should navigate to /profile");
}

// 2. Search Shortcuts
{
  setupTest();
  const navSearch = document.getElementById("nav-search");
  fireKeydown({ key: "/" });
  assert.equal(document.activeElement, navSearch, "/ should focus primary search input");

  let customSearchFocus = false;
  setupTest({
    onSearchFocus: () => { customSearchFocus = true; }
  });
  fireKeydown({ key: "/" });
  assert.equal(customSearchFocus, true, "/ should call custom onSearchFocus callback");
}

// 3. Ctrl+K (Global Search / Command Palette)
{
  setupTest();
  const navSearch = document.getElementById("nav-search");
  fireKeydown({ key: "k", ctrlKey: true });
  assert.deepEqual(commandPaletteEvents, ["toggle"], "Ctrl+K should dispatch toggleCommandPalette custom event");
  assert.equal(document.activeElement, navSearch, "Ctrl+K should focus primary search input as fallback");
}

// 4. Escape close UI handling
{
  setupTest();
  fireKeydown({ key: "Escape" });
  assert.deepEqual(commandPaletteEvents, ["close"], "Escape should dispatch closeCommandPalette custom event");

  let closeHelpCalled = false;
  let closeModalsCalled = false;
  let closeCalled = false;

  setupTest({
    onCloseHelp: () => { closeHelpCalled = true; },
    onCloseModals: () => { closeModalsCalled = true; },
    onClose: () => { closeCalled = true; }
  });

  fireKeydown({ key: "Escape" });
  assert.equal(closeHelpCalled, true, "Escape should invoke onCloseHelp");
  assert.equal(closeModalsCalled, true, "Escape should invoke onCloseModals");
  assert.equal(closeCalled, true, "Escape should invoke onClose");
}

// 5. Input Protection (Ignore during typing)
{
  setupTest();
  
  const bodyText = document.getElementById("body-text");
  bodyText.focus();
  const evAltD = fireKeydown({ key: "d", altKey: true });
  assert.deepEqual(navigatedPaths, [], "Alt+D should be ignored when typing in input");
  assert.equal(evAltD.defaultPrevented, false, "Alt+D event should not be defaultPrevented when typing");

  const bodySelect = document.getElementById("body-select");
  bodySelect.focus();
  fireKeydown({ key: "/" });
  assert.notEqual(document.activeElement, document.getElementById("nav-search"), "/ should be ignored when typing in select");

  const contentEdit = document.getElementById("content-edit");
  contentEdit.focus();
  fireKeydown({ key: "/" });
  assert.notEqual(document.activeElement, document.getElementById("nav-search"), "/ should be ignored when typing in contenteditable");
}

// 6. Escape should still fire even when focused inside inputs
{
  let closeCalled = false;
  setupTest({
    onClose: () => { closeCalled = true; }
  });
  
  const bodyText = document.getElementById("body-text");
  bodyText.focus();
  
  fireKeydown({ key: "Escape" });
  assert.equal(closeCalled, true, "Escape should still fire when typing inside text input");
}

// 7. Backward-compatible sequence keys
{
  setupTest();
  fireKeydown({ key: "g" });
  fireKeydown({ key: "h" });
  assert.deepEqual(navigatedPaths, ["/"], "gh should navigate to /");

  setupTest();
  fireKeydown({ key: "g" });
  fireKeydown({ key: "e" });
  assert.deepEqual(navigatedPaths, ["/events"], "ge should navigate to /events");

  // modal active should disable sequence keys
  setupTest({ isOpen: true });
  fireKeydown({ key: "g" });
  fireKeydown({ key: "e" });
  assert.deepEqual(navigatedPaths, [], "ge sequence navigation should be ignored if modal is open");
}

console.log("All useKeyboardShortcuts tests passed ✓");
