import assert from "node:assert/strict";
import {
  createShortcutManager,
  getEventShortcut,
  isEditableTarget,
  isReservedShortcut,
  normalizeShortcut,
} from "../src/utils/shortcutManager.js";

const createTarget = () => {
  const listeners = new Map();

  return {
    listeners,
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    removeEventListener(type, handler) {
      if (listeners.get(type) === handler) {
        listeners.delete(type);
      }
    },
    keydown(event) {
      listeners.get("keydown")?.(event);
    },
  };
};

const createEvent = (key, options = {}) => {
  let defaultPrevented = false;

  return {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    target: { tagName: "BODY" },
    ...options,
    preventDefault() {
      defaultPrevented = true;
    },
    get defaultPrevented() {
      return defaultPrevented;
    },
  };
};

assert.equal(normalizeShortcut("Ctrl+K"), "ctrl+k");
assert.equal(normalizeShortcut("primary + shift + r"), "primary+shift+r");
assert.equal(normalizeShortcut("g h"), "g h");
assert.equal(getEventShortcut(createEvent("k", { ctrlKey: true })), "primary+k");
assert.equal(getEventShortcut(createEvent("k", { metaKey: true })), "primary+k");

assert.equal(isReservedShortcut("primary+r"), true);
assert.equal(isReservedShortcut("primary+s"), true);
assert.equal(isReservedShortcut("primary+f"), true);
assert.equal(isReservedShortcut("primary+p"), true);
assert.equal(isReservedShortcut("primary+n"), true);
assert.equal(isReservedShortcut("primary+t"), true);
assert.equal(isReservedShortcut("primary+w"), true);
assert.equal(isReservedShortcut("alt+arrowleft"), true);
assert.equal(isReservedShortcut("primary+k"), false);

assert.equal(isEditableTarget({ tagName: "INPUT" }), true);
assert.equal(isEditableTarget({ tagName: "TEXTAREA" }), true);
assert.equal(isEditableTarget({ tagName: "SELECT" }), true);
assert.equal(isEditableTarget({ tagName: "DIV", isContentEditable: true }), true);
assert.equal(isEditableTarget({ tagName: "BUTTON" }), false);

{
  const target = createTarget();
  const conflicts = [];
  const manager = createShortcutManager({ target, onConflict: (message) => conflicts.push(message) });
  let firstCount = 0;
  let secondCount = 0;

  manager.register({ id: "first", shortcut: "g h", handler: () => firstCount += 1 });
  manager.register({ id: "second", shortcut: "g h", handler: () => secondCount += 1 });

  target.keydown(createEvent("g"));
  target.keydown(createEvent("h"));

  assert.equal(firstCount, 1);
  assert.equal(secondCount, 0);
  assert.equal(conflicts.length, 1);
}

{
  const target = createTarget();
  const reserved = [];
  const manager = createShortcutManager({ target, onReserved: (message) => reserved.push(message) });
  let called = false;

  manager.register({ id: "bad-refresh", shortcut: "primary+r", handler: () => called = true });
  target.keydown(createEvent("r", { ctrlKey: true }));

  assert.equal(called, false);
  assert.equal(reserved.length, 1);
}

{
  const target = createTarget();
  const manager = createShortcutManager({ target });
  let called = false;

  manager.register({ id: "search", shortcut: "/", handler: () => called = true });
  target.keydown(createEvent("/", { target: { tagName: "INPUT" } }));

  assert.equal(called, false);
}

{
  const target = createTarget();
  const manager = createShortcutManager({ target });
  let called = false;

  manager.register({
    id: "editable-allowed",
    shortcut: "primary+k",
    allowInEditable: true,
    handler: () => called = true,
  });
  target.keydown(createEvent("k", { metaKey: true, target: { tagName: "INPUT" } }));

  assert.equal(called, true);
}

{
  const target = createTarget();
  const manager = createShortcutManager({ target });
  let called = false;

  manager.register({ id: "find", shortcut: "primary+f", allowReserved: true, handler: () => called = true });
  target.keydown(createEvent("f", { ctrlKey: true }));

  assert.equal(called, false);
}

console.log("shortcut manager tests passed");
