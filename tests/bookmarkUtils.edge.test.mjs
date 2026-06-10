import assert from "node:assert/strict";

const store = {};
globalThis.window = {
  localStorage: {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
  },
  dispatchEvent: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
};

const {
  addBookmarkedEvent,
  getBookmarkedEvents,
  removeBookmarkedEvent,
} = await import("../src/utils/bookmarkUtils.js");

assert.deepEqual(addBookmarkedEvent(null), []);
assert.deepEqual(addBookmarkedEvent({ title: "No id" }), []);

addBookmarkedEvent({ id: 10, title: "Saved" });
assert.equal(getBookmarkedEvents().length, 1);

const afterMissingRemoval = removeBookmarkedEvent(999);
assert.equal(afterMissingRemoval.length, 1, "removing missing id keeps existing bookmarks");
assert.equal(getBookmarkedEvents()[0].id, 10);

const afterValidRemoval = removeBookmarkedEvent("10");
assert.deepEqual(afterValidRemoval, []);

delete globalThis.window;

console.log("bookmarkUtils edge-case tests passed ✓");
