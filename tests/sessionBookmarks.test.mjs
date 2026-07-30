import assert from "node:assert/strict";

const store = {};
globalThis.window = {
  sessionStorage: {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  },
};

const {
  addSessionBookmark,
  removeSessionBookmark,
  getSessionBookmarks,
  isSessionBookmarked,
  clearSessionBookmarks,
} = await import("../src/utils/sessionBookmarks.js");

try {
  // Empty state
  assert.deepEqual(getSessionBookmarks(), []);

  // Add bookmark
  const event = { id: "evt_1", title: "React Workshop", url: "/events/evt_1" };
  const bookmarks1 = addSessionBookmark(event);
  assert.equal(bookmarks1.length, 1);
  assert.equal(bookmarks1[0].id, "evt_1");

  // Check if bookmarked
  assert.equal(isSessionBookmarked("evt_1"), true);
  assert.equal(isSessionBookmarked("evt_unknown"), false);

  // Duplicate addition
  const bookmarks2 = addSessionBookmark(event);
  assert.equal(bookmarks2.length, 1);

  // Remove bookmark
  const bookmarks3 = removeSessionBookmark("evt_1");
  assert.equal(bookmarks3.length, 0);
  assert.equal(isSessionBookmarked("evt_1"), false);

  // Clear all
  addSessionBookmark({ id: "a", title: "A" });
  addSessionBookmark({ id: "b", title: "B" });
  assert.equal(getSessionBookmarks().length, 2);
  clearSessionBookmarks();
  assert.deepEqual(getSessionBookmarks(), []);

  // Edge: null/undefined id
  const noId = addSessionBookmark({ title: "no id" });
  assert.deepEqual(noId, []);

  // Edge: non-existent removal
  const rem = removeSessionBookmark("nonexistent");
  assert.deepEqual(rem, []);

  console.log("sessionBookmarks tests passed ✓");
} finally {
  delete globalThis.window;
}
